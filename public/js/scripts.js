
const refreshGalleryContents = function(json) {
  let galleryContents = '';
  for(let i = 0; i < json.length; i++){
    galleryContents += '<li> <figure> <img class="petTile" src="'
      +json[i].link+'" alt="Cute picture of '
      +json[i].name+'"> <figcaption>'
      +json[i].name+' says '
      +json[i].call+'</figcaption> </figure> <button id="'
      +json[i].id+'" onclick="deleteEntry(this.id)" class="delete">Delete</button> </li>';
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

window.onload = function() {
  const button = document.querySelector( '#createPet' )
  button.onclick = submit
  //submitNoFields()
}

/*
window.onpageshow = function () {
  submitNoFields()
}*/