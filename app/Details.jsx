var React    = require('react/addons');
var component = require('omniscient')
var Entries = require('./Entries')
var page = require('page')
var {assign} = require('lodash')

exports.Entry = component(function({entry, canEdit}) {

  var style = {
    position: 'fixed',
    color: 'white',
    top: 0, left: 0, bottom: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.85)'
  }
  

  var parentStyle = {
    position:'relative'
  }

  var buttonStyle = {
    position: 'absolute',
    top: 0,
    right: 20,
    display: (canEdit.deref()) ? 'block' : 'none'
  }

  function onClose(e) {
    if (e.target.id != "edit-btn") {
      page('/timeline')
    }
  }

  var editUrl = "/edit/" + entry.get('id')

  var content = ""

  if (entry.get('entryType') == "Moment") {
    content = <Moment entry={entry} />
  }
  else {
    content = <Generic entry={entry} />
  }

  return <div style={style} onClick={onClose}>
    <div className="row" style={{marginTop: 20}}>
      <div className="small-12 columns" style={parentStyle}>
        <div style={buttonStyle}>
          <a href={editUrl} id="edit-btn" className="button secondary">Edit</a>
        </div>
        {content}
      </div>
    </div>
  </div>
}).jsx

var white = { color: 'white' }
var right = {float: 'right'}

var imageBoxStyle = {
  height: 600,
  margin: '0px auto'
}

var infoBoxStyle = {
  marginTop: 20
}

var Moment = component(function({entry}) {

  var showImage = {display:(entry.get('image')) ? 'block' : 'none'}

  return <div>
    <div style={assign(imageBoxStyle, showImage)}>
      <a className="th"><img src={Entries.imageUrl(entry)} style={{height: '100%'}}/></a>
    </div>
    <div style={infoBoxStyle}>
      <h4 style={white}>{entry.get('name')}</h4>
      <p style={white}>{entry.get('date')}</p>
      <p style={white}>{entry.get('comment')}</p>
    </div>
  </div>
}).jsx

var Generic = component(function({entry}) {
  console.log("GENERIC")
  return <div style={infoBoxStyle}>
    <h4 style={white}>{entry.get('entryType')}: {entry.get('name')}</h4>
    <p style={white}>{entry.get('date')}</p>
    <p style={white}>{entry.get('comment')}</p>
  </div>
}).jsx
