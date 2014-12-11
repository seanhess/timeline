/**
 * @jsx React.DOM
 */

window.React   = require('react/addons');
var Immutable  = require('immutable')
var component = require('omniscient')
var immstruct  = require('immstruct')
var _ = require('lodash')
var Entries = require('./Entries')
var Weeks = require('./Weeks')

var SimpleTable = require('./SimpleTable')

// INIT -------------------------------------------------------

// APP --------------------------------------------------------

var App = component(function({cursor}) {
  var entries = cursor.cursor('entries')
  return <div style={{padding: 10, width: 600}}>
      <Weeks entries={entries}/>
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
