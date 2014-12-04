/**
 * @jsx React.DOM
 */

window.React   = require('react/addons');
var Immutable  = require('immutable')
var component = require('omniscient')
var immstruct  = require('immstruct')
var _ = require('lodash')
var axios = require('axios')

var SimpleTable = require('./SimpleTable')

// INIT -------------------------------------------------------

// APP --------------------------------------------------------

var App = component(function({cursor}) {
  var entries = cursor.cursor('entries')
  console.log("AND HOW", cursor.toJS())
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

var state = immstruct({entries: []})
state.on('swap', render)

// Load data
axios.get('/entries')
.then((rs) => rs.data)
.then(function(data) {
  console.log("WOO", data)
  state.cursor('entries').update(() => Immutable.fromJS(data))
})

render()

