// Setup
const refreshGalleryContents = function(json) {
  let galleryContents = '';
  for(let i = 0; i < json.length; i++){
    galleryContents += '<li id="'
      +json[i]._id+'"> <figure> <img class="petTile" src="'
      +json[i].link+'" alt="Picture of a '
      + ((json[i].type === "Other") ? "Pet" : json[i].type) + ' named '
      +json[i].name+'"> <figcaption name="'
      +json[i].name+'">'
      +json[i].name+' says '
      +json[i].call+'</figcaption> </figure> <button value="'
      +json[i]._id+'" onclick="deleteEntry(this.value)">Delete</button> <button value="'
      +json[i]._id+'" onclick="enterEditMode(this.value)">Edit</button></li>';
  }
  const gallery = document.querySelector( '#gallery' )
  gallery.innerHTML = galleryContents;
}

const refreshGalleryContentsHandleError = function(json) {
    if(json.hasOwnProperty("error")){
      document.querySelector( '#error' ).innerHTML = json.error;
      refreshGalleryContents(json.contents)
    } else {
      document.querySelector( '#error' ).innerHTML = "";
      refreshGalleryContents(json)
    }
}

window.onload = function() {
  const button = document.querySelector( '#createPet' )
  button.onclick = submit
  getAllPets()
}


window.onpageshow = function () {
  getAllPets()
}

// Get
const getAllPets = function( e ) {
  fetch('/get')
  .then( function( response ) {
    return response.json();
  })
  .then( function(json) {
    if(json.hasOwnProperty("error")){
      document.querySelector( '#error' ).innerHTML = json.error;
      refreshGalleryContents(json.contents)
    } else {
      document.querySelector( '#error' ).innerHTML = "";
      refreshGalleryContents(json)
    }
  })

  return false
}

// Create

const submit = function( e ) {
  // prevent default form action from being carried out
  e.preventDefault()

  const name = document.querySelector( 'input[name="name"]' ),
          link = document.querySelector( 'input[name="link"]' ),
          type = document.querySelector( 'select[name="type"]' ),
        json = { name: name.value, link: link.value, type: type.value },
        body = JSON.stringify( json )

  fetch( '/createOrUpdatePet', {
    method:'POST',
    body,
    headers:{
      "Content-Type": "application/json"
    }
  })
  .then( function( response ) {
    return response.json();
  })
  .then( function(json) {
    if(json.hasOwnProperty("error")){
      document.querySelector( '#error' ).innerHTML = json.error;
      refreshGalleryContents(json.contents)
    } else {
      document.querySelector( '#error' ).innerHTML = "";
      refreshGalleryContents(json)
    }
  })

  return false
}

// Update

const enterEditMode = function(clickedId) {
  const liElement = document.querySelector( 'li[id="'+clickedId+'"]' )
  const name = liElement.querySelector("figcaption").getAttribute("name")
  const link = liElement.querySelector("img").getAttribute("src")
  liElement.innerHTML = '<form action=""> <label>Pet Name: <input name="editName" value="'
    +name+'"></label> <label>Image Link: <input name="editLink" value="'
    +link+'"></label><label>Pet Type:<select name="editType" value="Cat"><option>Dog</option><option>Cat</option><option>Snake</option><option>Bird</option><option>Other</option></select></label></form><button value="'
    +clickedId+'" onclick="confirmEdits(this.value)">Edit That Pet!</button>'
}

const confirmEdits = function(clickedId) {
  const liElement = document.querySelector( 'li[id="'+clickedId+'"]' )
  const name = liElement.querySelector( 'input[name="editName"]' ),
          link = liElement.querySelector( 'input[name="editLink"]' ),
          type = liElement.querySelector( 'select[name="editType"]' ),
          json = { _id: clickedId, name: name.value, link: link.value, type: type.value },
          body = JSON.stringify( json )

  fetch( '/createOrUpdatePet', {
    method:'POST',
    body,
    headers:{
      "Content-Type": "application/json"
    }
  })
  .then( function( response ) {
    return response.json();
  })
  .then( function(json) {
    if(json.hasOwnProperty("error")){
      document.querySelector( '#error' ).innerHTML = json.error;
      refreshGalleryContents(json.contents)
    } else {
      document.querySelector( '#error' ).innerHTML = "";
      refreshGalleryContents(json)
    }
  })

  return false
  
}

//Delete 

const deleteEntry = function (clickedId) {
  let body = JSON.stringify({"id": clickedId});
  fetch( '/delete', {
    method:'POST',
    body,
    headers:{
      "Content-Type": "application/json"
    }
  })
  .then( function( response ) {
    return response.json();
  })
  .then( function(json) {
    if(json.hasOwnProperty("error")){
      document.querySelector( '#error' ).innerHTML = json.error;
      refreshGalleryContents(json.contents)
    } else {
      document.querySelector( '#error' ).innerHTML = "";
      refreshGalleryContents(json)
    }
  })
}