/**
 * @jsx React.DOM
 */

window.React   = require('react/addons');
var Immutable  = require('immutable')
var component = require('omniscient')
var immstruct  = require('immstruct')
var _ = require('lodash')

var SimpleTable = require('./SimpleTable')

// INIT -------------------------------------------------------

// APP --------------------------------------------------------

var App = component(function({cursor}) {
  var entries = cursor.cursor('entries')
  return <div className="row">
    <div className="small-12 column">
      <h1>Entries</h1>
      <SimpleTable entries={entries}/>
    </div>
  </div>
}).jsx

function render() {
  React.render(
    <App cursor={state.cursor()}/>,
    document.getElementById('content')
  );
}

var state = immstruct({entries: ENTRIES})
state.on('swap', render)

render()

