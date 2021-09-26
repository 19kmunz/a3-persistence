window.onload = function() {
  const button = document.querySelector( '#login' )
  button.onclick = submit
}

const submit = function( e ) {
  // prevent default form action from being carried out
  e.preventDefault()

  const username = document.querySelector( 'input[name="username"]' ),
          password = document.querySelector( 'input[name="password"]' ),
          type = document.querySelector( 'select[name="type"]' ),
        json = { name: name.value, link: link.value, type: type.value },
        body = JSON.stringify( json )

  fetch( '/login', {
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
    refreshGalleryContents(json)
  })

  return false
}