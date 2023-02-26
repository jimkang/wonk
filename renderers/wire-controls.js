var { select } = require('d3-selection');

var OLPE = require('one-listener-per-element');
var resetButtonSel = select('#reset-button');

var { on } = OLPE();

function wireControls({ onReset, onBone }) {
  resetButtonSel.attr('disable', false);
  on('#reset-button', 'click', onResetClick);
  on('#bone-button', 'click', onBone);

  function onResetClick() {
    onReset();
  }
}

module.exports = wireControls;
