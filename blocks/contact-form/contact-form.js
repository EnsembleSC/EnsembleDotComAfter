function validateEmail() {
  const email = document.querySelector('#email');
  const isEmail = email
    .value
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );

  email.className = !isEmail ? "malformed" : "";
  return isEmail;
};

function submitForm() {
  const email = document.querySelector('#email').value;
  const comments = document.querySelector('#comments').value;

  if (!validateEmail()) return;

  // change link to your email-form URL
  fetch('https://main--ensembledotcomafter--ensemblesc.hlx.page/email-form', {
    method: "POST",
    body: new URLSearchParams({
      'email': email,
      'comments': comments,
    }),
    headers: {
      "Content-Type": "appication/x-www-form-urlencoded",
    }
  }).then((response) => {
    console.log(response.json());
  });
}

export default function decorate(block) {
  block.innerHTML = "";

  const form = document.createElement('form');

  // create email input
  const emailLabel = document.createElement('label');
  const emailInput = document.createElement('input');
  emailLabel.innerText = "Email:";
  emailLabel.setAttribute("for", "email");
  emailInput.setAttribute("type", "text");
  emailInput.setAttribute("id", "email");
  emailInput.setAttribute("name", "email");
  emailInput.onchange = validateEmail;

  form.append(emailLabel);
  form.append(emailInput);

  // create comment input
  const commentLabel = document.createElement('label');
  const commentInput = document.createElement('textarea');
  commentLabel.innerText = "Comments:";
  commentLabel.setAttribute("for", "comments");
  commentInput.setAttribute("type", "text");
  commentInput.setAttribute("id", "comments");
  commentInput.setAttribute("name", "comments");
  commentInput.setAttribute("rows", "10");

  form.append(commentLabel);
  form.append(commentInput);

  // submit button
  const submitButton = document.createElement('button');
  submitButton.innerText = "SUBMIT";
  submitButton.setAttribute("type", "button");
  submitButton.onclick = submitForm;
  
  form.append(submitButton);

  block.append(form);
}
