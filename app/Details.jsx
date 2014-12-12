var React    = require('react/addons');
var component = require('omniscient')
var Entries = require('./Entries')
var page = require('page')

exports.Entry = component(function({entry}) {

  var style = {
    position: 'fixed',
    color: 'white',
    top: 0, left: 0, bottom: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.85)'
  }

  var imageBoxStyle = {
    height: 600,
    margin: '0px auto'
  }

  var infoBoxStyle = {
    marginTop: 20
  }
  
  var white = { color: 'white' }

  var parentStyle = {
    position:'relative'
  }

  var buttonStyle = {
    position: 'absolute',
    top: 0,
    right: 20,
  }

  function onClose(e) {
    console.log("WOOT", e.target)
    if (e.target.id != "edit-btn") {
      page('/timeline')
    }
  }

  var editUrl = "/edit/" + entry.get('name')

  return <div style={style} onClick={onClose}>
    <div className="row" style={{marginTop: 20}}>
      <div className="small-12 columns" style={parentStyle}>
        <div style={buttonStyle}><a href={editUrl} id="edit-btn" className="button secondary">Edit</a></div>
        <div style={imageBoxStyle}>
          <a className="th"><img src={Entries.imageUrl(entry)} style={{height: '100%'}}/></a>
        </div>
        <div style={infoBoxStyle}>
          <p style={white}>{entry.get('date')}</p>
          <p style={white}>{entry.get('comment')}</p>
        </div>
      </div>
    </div>
  </div>
}).jsx
