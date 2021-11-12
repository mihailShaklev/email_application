document.addEventListener('DOMContentLoaded', function() {


  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email());
  document.querySelector('#send-mail').addEventListener('click', () => send_mail());
  document.querySelector('#reply').addEventListener('click', () => reply());
  document.querySelector('#archive').addEventListener('click', () => archive());
  document.querySelector('#unarchive').addEventListener('click', () => unarchive());


  // By default, load the inbox
  load_mailbox('inbox');

});


function send_mail() {

  // Get the valuse from the fields
  let recipients = document.querySelector('#compose-recipients').value;
  let subject = document.querySelector('#compose-subject').value;
  let body = document.querySelector('#compose-body').value;

  //Send the mail
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  });

  //Redirect to sent box
  load_mailbox('sent');

}

function compose_email() {

  // Show compose view and hide other views
   document.querySelector('#mail-box').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#mail-box').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email').style.display = 'none';

  // Clear the mailbox
  document.querySelector('#mail-box').innerHTML = '';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;



    //Get the mailbox
    fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(result => {

         result.forEach((mail, i) => {

           var recipients = document.createElement('div');
           var sender = document.createElement('div');
           var subject = document.createElement('div');
           var timestamp = document.createElement('div');

           recipients.innerHTML = mail.recipients;
           sender.innerHTML = mail.sender;
           subject.innerHTML = mail.subject;
           timestamp.innerHTML = mail.timestamp;

           recipients.className = 'element';
           sender.className = 'element';
           subject.className = 'element';
           timestamp.className = 'element';

           timestamp.style.float = "right";
           timestamp.style.fontWeight = "lighter";
           recipients.style.fontWeight = "bold";
           sender.style.fontWeight = "bold";

           var div = document.createElement('div');
           div.className = 'wrapper';

           if (mail.read == false) {
             div.style.background = "white";
           }else{
              div.style.background = "#e6e6e6";
           }

           if(mailbox == "inbox" || mailbox == "archive") {

             div.append(sender);
             div.append(subject);
             div.append(timestamp);

           } else if (mailbox == "sent"){

             div.append(recipients);
             div.append(subject);
             div.append(timestamp);

           }

           //Show the email itself when the user clicks on it
           div.addEventListener('click', function(){


              fetch(`/emails/${mail.id}`, {
              method:'PUT',
              body: JSON.stringify({
              read: true
              })
              });

           document.querySelector('#mail-box').style.display = 'none';
           document.querySelector('#emails-view').style.display = 'none';
           document.querySelector('#compose-view').style.display = 'none';

           if (mailbox == "sent") {

             document.querySelector("#archive").style.display = 'none';
             document.querySelector("#unarchive").style.display = 'none';
           } else {

             document.querySelector("#archive").style.display = 'inline';
             document.querySelector("#unarchive").style.display = 'none';

           }

           if (mailbox == "archive") {

             if(mail.archived == true) {

              document.querySelector("#archive").style.display = 'none';
              document.querySelector("#unarchive").style.display = 'inline';

             }
           }
           document.querySelector('#email').style.display = 'block';
           document.querySelector('#message-header').innerHTML = `<div><span>From: </span>${mail.sender}</div><div><span>To: </span>${mail.recipients}</div><div><span>Subject: </span>${mail.subject}</div><div><span>Timestamp: </span>${mail.timestamp}</div>`;
           document.querySelector('#message-body').innerHTML = mail.body;
           document.querySelector('#mail-id').value = mail.id;

           });

           document.querySelector('#mail-box').append(div);

         });

    });


}

function reply() {

  //Get the email id from a hidden input field
  var mailid = document.querySelector('#mail-id').value;

  //Get the email by the id
  fetch(`/emails/${mailid}`)
  .then(response => response.json())
  .then(mail => {

    // Show the compose email form
  document.querySelector('#mail-box').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email').style.display = 'none';

  // Pre-fill composition fields
  document.querySelector('#compose-recipients').value = mail.sender;
  document.querySelector('#compose-subject').value = `Re:${mail.subject}`;
  document.querySelector('#compose-body').innerHTML = `On ${mail.timestamp} ${mail.sender} wrote: ${mail.body}`;

  });

}

function archive() {

  //Get the email id from a hidden input field
  var mailid = document.querySelector('#mail-id').value;

  //Archive the email
  fetch(`/emails/${mailid}`, {
    method:'PUT',
    body:JSON.stringify({
    archived: true
    })
  });

  //Redirect to the inbox
  load_mailbox('inbox');
}

function unarchive() {

  //Get the email id from a hidden input field
  var mailid = document.querySelector('#mail-id').value;

  //Unarchive the email
  fetch(`/emails/${mailid}`, {
    method:'PUT',
    body:JSON.stringify({
    archived: false
    })
  });

  //Redirect to the inbox
  load_mailbox('inbox');
}