
const refreshGalleryContents = function(json) {
  let galleryContents = '';
  for(let i = 0; i < json.length; i++){
    galleryContents += '<li id="'
      +json[i].id+'"> <figure> <img class="petTile" src="'
      +json[i].link+'" alt="Cute picture of '
      +json[i].name+'"> <figcaption name="'
      +json[i].name+'">'
      +json[i].name+' says '
      +json[i].call+'</figcaption> </figure> <button value="'
      +json[i].id+'" onclick="deleteEntry(this.value)">Delete</button> <button value="'
      +json[i].id+'" onclick="enterEditMode(this.value)">Edit</button></li>';
  }
  const gallery = document.querySelector( '#gallery' )
  gallery.innerHTML = galleryContents;
}
const deleteEntry = function (clickedId) {
  let body = JSON.stringify({"id": clickedId});
  fetch( '/delete', {
    method:'POST',
    body
  })
  .then( function( response ) {
    return response.json();
  })
  .then( function(json) {
    refreshGalleryContents(json)
  })
}
const submit = function( e ) {
  // prevent default form action from being carried out
  e.preventDefault()

  const name = document.querySelector( 'input[name="name"]' ),
          link = document.querySelector( 'input[name="link"]' ),
          type = document.querySelector( 'select[name="type"]' ),
        json = { name: name.value, link: link.value, type: type.value },
        body = JSON.stringify( json )

  fetch( '/submit', {
    method:'POST',
    body 
  })
  .then( function( response ) {
    return response.json();
  })
  .then( function(json) {
    refreshGalleryContents(json)
  })

  return false
}

const submitNoFields = function( e ) {

  const json = { name: '', link: '', type: '' },
          body = JSON.stringify( json )

  fetch( '/submit', {
    method:'POST',
    body
  })
  .then( function( response ) {
    return response.json();
  })
  .then( function(json) {
    refreshGalleryContents(json)
  })

  return false
}

const enterEditMode = function(clickedId) {
  const liElement = document.querySelector( 'li[id="'+clickedId+'"]' )
  const name = liElement.querySelector("figcaption").getAttribute("name")
  const link = liElement.querySelector("img").getAttribute("src")
  liElement.innerHTML = '<form action=""> <label>Pet Name: <input name="name" value="'
    +name+'"></label> <label>Image Link: <input name="link" value="'
    +link+'"></label><label>Pet Type:<select name="type" value="Cat"><option>Dog</option><option>Cat</option><option>Snake</option><option>Bird</option><option>Other</option></select></label></form><button value="'
    +clickedId+'" onclick="confirmEdits(this.value)">Edit That Pet!</button><button value="'
    +clickedId+'" onclick="exitEditMode(this.value)">Cancel</button>'
}
const exitEditMode = function(clickedId) {
  const liElement = document.querySelector( "id="+clickedId )
  
}
const confirmEdits = function(clickedId) {
  const liElement = document.querySelector( "id="+clickedId )
  
}
window.onload = function() {
  const button = document.querySelector( '#createPet' )
  button.onclick = submit
  //submitNoFields()
}

/*
window.onpageshow = function () {
  submitNoFields()
}*/