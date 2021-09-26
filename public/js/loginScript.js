window.onload = function() {
  const button = document.querySelector("#login");
  button.onclick = submit;
};

const submit = function(e) {
  // prevent default form action from being carried out
  e.preventDefault();

  const username = document.querySelector('input[name="username"]'),
    password = document.querySelector('input[name="password"]'),
    json = { username: username.value, password: password },
    body = JSON.stringify(json);

  fetch("/login", {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(function(response) {
      console.log(response);
      return response.json();
    })
    .then(function(json) {
      if (json.hasOwnProperty("error")) {
        const username = document.querySelector('input[name="username"]'),
          password = document.querySelector('input[name="password"]'),
          errorP = document.querySelector("#error");
        errorP.innerHtml = json.error;
        if (json.hasOwnProperty("highlighted") && json.highlighted == true) {
          username.setAttribute("aria-invalid", "true");
          password.setAttribute("aria-invalid", "true");
        } else {
          username.removeAttribute("aria-invalid");
          password.removeAttribute("aria-invalid");
        }
      }
    });

  return false;
};
