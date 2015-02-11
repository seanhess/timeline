/**
 * @jsx React.DOM
 */
var React    = require('react/addons');
var Dropzone = require('react-dropzone')
var component = require('omniscient')
var Entries = require('./Entries')
var page = require('page')

//function updateEntryImage(entry) {
  //return function(file) {
    //console.log("DROP FILE", entry.get('id'), file)
    //var xhr = new XMLHttpRequest()
    //var fd = new FormData()
    //var url = "/entries/"+entry.get('id')+'/image'
    //console.log("URL", url, entry.toJS())
    //xhr.open("PUT", url, true);
    //xhr.onreadystatechange = function() {
        //if (xhr.readyState == 4) {
          //if (xhr.status == 200) {
            //window.location.reload()
          //}
        //}
    //}
    //fd.append('file', file)
    //xhr.send(fd)
  //}
//}


var MomentDropper = exports.MomentDropper = React.createClass({
  render: function() {
    return <Dropzone handler={this.props.onFile} size={200} message="Drag and drop a file here">
      <div style={{width: '100%', height: '100%'}}>
        {this.props.children}
      </div>
    </Dropzone>
  }
})

exports.Entry = component(function({entry}) {

  var style = {}

  function onSave() {
    Entries.save(entry)
    Entries.edit(null)
    page('/timeline')
  }

  function onClose() {
    Entries.edit(null)
    page('/timeline')
  }

  function onDelete() {
    Entries.delete(entry)
    Entries.edit(null)
    page('/timeline')
  }

  function onEdit(field) {
    return function(e) {
      entry.cursor(field).update(() => e.currentTarget.value)
    }
  }

  function onClickBackground(e) {
    if (e.target.id == "overlay-bg") {
      onClose()
    }
  }

  return <div style={style} onClick={onClickBackground} id="overlay-bg">
    <div className="row" style={{marginTop: 20}}>
      <div className="small-12 columns">
        <div className="row">
          <div className="small-8 columns">
            <p><img src={Entries.imageUrl(entry)} style={{width: '100%'}}/></p>
          </div>
          <aside className="small-4 columns">
            <div><button onClick={onSave} className="expand">Save</button></div>
            <div>
              <select value={entry.get('entryType')} onChange={onEdit('entryType')}>
                <option value="Moment">Moment</option>
                <option value="Project">Project</option>
                <option value="Book">Book</option>
              </select>
            </div>
            <div><input type="text" placeholder="name" value={entry.get('name')} onChange={onEdit('name')} /></div>
            <div><textarea placeholder="comment" style={{height: 200}} onChange={onEdit('comment')} value={entry.get('comment')}>
            </textarea></div>
            <div><input type="text" placeholder="2014-10-20" onChange={onEdit('date')} value={entry.get('date')}/></div>
            <div>
              <a onClick={onDelete} className="secondary">Delete</a>
            </div>
          </aside>
        </div>
      </div>
    </div>
  </div>
}).jsx
