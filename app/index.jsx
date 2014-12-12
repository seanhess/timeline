/**
 * @jsx React.DOM
 */

window.React   = require('react/addons');
var Immutable  = require('immutable')
var component = require('omniscient')
var _ = require('lodash')
var Entries = require('./Entries')
var Weeks = require('./Weeks')
var Editor = require('./Editor')
var Details = require('./Details')
var page = require('page')

console.log("Timeline: v2")

// INIT -------------------------------------------------------
Entries.state.on('swap', render)
Entries.load()

// APP --------------------------------------------------------

var App = React.createClass({
  render: function() {
    var contents = this.props.currentPage()

    return <div style={{padding: 10, color: '#AAA'}}>
      <Editor.MomentDropper>
        <div>{contents}</div>
      </Editor.MomentDropper>
    </div>
  }
})


var currentPage = null
function render() {
  // render the current page. It chooses its own cursors
  if (!currentPage) return
  React.render(
    <App currentPage={currentPage} />,
    document.getElementById('content')
  );
}

function route(f) {
  return function(ctx) {
    // this function is called every time the url changes
    currentPage = f(ctx)
    render()
  }
}

page('/timeline', route(function() {
  console.log("BACK TO MAIN")
  return function() {
    return <Weeks entries={Entries.state.cursor('entries')}/>
  }
}))

page('/edit/:name', route(function({params}) {

  var entry = Entries.findByName(params.name)
  Entries.edit(entry)

  return function() {
    return <Editor.Entry entry={Entries.state.cursor('editing')}/>
  }
}))

page('/details/:name', route(function({params}) {

  var entry = Entries.findByName(params.name)
  Entries.details(entry)

  return function() {
    return <div>
      <Weeks entries={Entries.state.cursor('entries')}/>
      <Details.Entry entry={Entries.state.cursor('details')}/>
    </div>
  }
}))

page('*', route(function() {
  return function() {
    return <div>Not Found</div>
  }
}))

page.start({hashbang: true})
//page.base("/timeline")

