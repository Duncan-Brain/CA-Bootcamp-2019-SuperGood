const routes = require('next-routes')();

routes
    .add('/build-committee', '/build-committee')
    .add('/our-charity-portfolio', '/our-charity-portfolio')
    .add('/account/:address', '/account/showme')
    .add('/committee/:address', '/committee/showme')
    .add('/portfolio/:address', '/portfolio/showme');

module.exports = routes;