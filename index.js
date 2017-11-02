const path = require('path');

const resolveCurrentPlugins = () => {
  const [currentPlugins, ...args] = Array.from(arguments);
  if (typeof currentPlugins === 'function') {
    return currentPlugins(...args);
  } else if (currentPlugins && currentPlugins instanceof Array) {
    return currentPlugins;
  }
  return [];
}

const ruleChildren = (loader) => loader.use || loader.oneOf || Array.isArray(loader.loader) && loader.loader || []

const findIndexAndRules = (rulesSource, ruleMatcher) => {
    let result;
    const rules = Array.isArray(rulesSource) ? rulesSource : ruleChildren(rulesSource)
    rules.some((rule, index) => result = ruleMatcher(rule) ? {index, rules} : findIndexAndRules(ruleChildren(rule), ruleMatcher))
    return result
}

const cssRuleMatcher = rule => rule.test && String(rule.test) === String(/\.css$/)

const postCssLoaderMatcher = use => (use instanceof Object && use.loader && (use.loader.indexOf('postcss-loader') > -1));

const findPostCssLoader = rule => rule.use.find(postCssLoaderMatcher);

const findPostCssRuleLoader = (source) => {
    const {index, rules} = findIndexAndRules(source, cssRuleMatcher)
    return findPostCssLoader(rules[index]);
}

function rewirePostCssLoader(monkeypatcher) {
  if (typeof monkeypatcher !== 'function') {
    throw new Error(`rewirePostCssLoader expects a function, ${typeof monkeypatcher} given`);
  }
  return function override(config, env) {
    const postCssLoader = findPostCssRuleLoader(config.module.rules);
    if (postCssLoader) {
      monkeypatcher(postCssLoader, config, env);
    } else {
      throw new Error('PostCss loader is not found');
    }

    return config;
  }
}

module.exports = rewirePostCssLoader;

module.exports.rewirePostCssPlugins = function rewirePostCssPlugins(enhancer) {
  if (!(typeof enhancer === 'function' || Array.isArray(enhancer))) {
    throw new Error(`rewirePostCssPlugins expects a function or an array, ${typeof enhancer} given`);
  }
  return rewirePostCssLoader((postCssLoader) => {
    const currentPlugins = postCssLoader.options.plugins;
    postCssLoader.options.plugins = function(...args) {
      const resolvedCurrentPlugins = resolveCurrentPlugins(currentPlugins, ...args);
      if (typeof enhancer === 'function') {
        return enhancer(resolvedCurrentPlugins, ...args);
      } else {
        return resolvedCurrentPlugins.concat(enhancer);
      }
    }
  });
}
