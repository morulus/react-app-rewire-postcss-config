react-app-rewire-postcss-config
==

Transform [PostCss](https://github.com/postcss/postcss) loader in a [react-app-rewired](https://github.com/timarney/react-app-rewired) config


__Access PostCss whole loader__

You just pass a function, which accepts current PostCss loader object. And then you mutate it... No need to return result.

```js
const rewirePostCssLoader = require('react-app-rewire-postcss-config');

return rewirePostCssLoader((postCssLoader) => {
  postCssLoader.options.parser = 'sugarss';
});
```

__To transform PostCss plugins__

You pass a function, which accepts current plugins. You do something with current plugins, transforms it and then returns back.

```js
const { rewirePostCssPlugins } = require('react-app-rewire-postcss-config');
const postCssNext = require('postcss-cssnext');
const postCssNested = require('postcss-nested');

export default rewirePostCssPlugins((currentPlugins) => {
    return [
      postCssNested(),
      postCssNext(),
    ].concat(currentPlugins);
  })
```
