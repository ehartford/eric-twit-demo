/*
 * GET home page.
 */

exports.index = function(req, res) {
  res.render('index', { title: 'Eric Hartford Demo' });
};

exports.fight = function(req, res) {
  res.render('fight', { title: 'Eric Hartford Demo' });
};
