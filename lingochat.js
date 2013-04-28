Messages = new Meteor.Collection('messages');
Translations = new Meteor.Collection('translations');
Languages = new Meteor.Collection('languages');

if (Meteor.is_server) {
    //console.log("count before remove: " +Languages.find({}).count();
    var loadSourceLanguages = function() {
      Languages.remove({});
      var request_url = 'https://www.googleapis.com/language/translate/v2/languages';
      var request_params = {
        key: 'AIzaSyApd5b77jtVRZCfCAn6wzlaD52FoXeJwCw',
        target: 'en'
      }
      Meteor.http.get(request_url, {params: request_params}, function (err, res) {  
        if(err){
          console.log("Error: " + err);
        } else { 
          var languages = res.data.data.languages;
          for(var i = 0; i < languages.length; i++){
            console.log(languages[i].language);
            Languages.insert({
              name: languages[i].name,
              language: languages[i].language
             });
          }
        }
      });
  };
  
  Meteor.startup(function () {
    loadSourceLanguages();
  });
}

if (Meteor.is_client) {
  
  var setCSS = function(){
    $('#right-wrapper').scrollTop(300);
    $('#left-wrapper').scrollTop(300);
  };
 
 Meteor.startup(function () {
    setCSS();
  });

//COPIED FROM THE METEOR TODOS EXAMPLE:
// Returns an event map that handles the "escape" and "return" keys and
// "blur" events on a text input (given by selector) and interprets them
// as "ok" or "cancel".
  var okCancelEvents = function (selector, callbacks) {
    var ok = callbacks.ok || function () {};
    var cancel = callbacks.cancel || function () {};
    var events = {};
    events['keyup '+selector+', keydown '+selector+', focusout '+selector] =
      function (evt) {
        if (evt.type === "keydown" && evt.which === 27) {
          // escape = cancel
          cancel.call(this, evt);

        } else if (evt.type === "keyup" && evt.which === 13 ||
                   evt.type === "focusout") {
          // blur/return/enter = ok/submit if non-empty
          var value = String(evt.target.value || "");
          if (value)
            ok.call(this, value, evt);
          else
            cancel.call(this, evt);
        }
      };

    return events;
  };

  var translateTextLeft = function(name, text, timestamp){
    var srcName = $('#source-select').val();
    var trgName = $('#target-select').val();
    var src = Languages.findOne({name:srcName}).language;
    var trg = Languages.findOne({name:trgName}).language;
    var request_url = 'https://www.googleapis.com/language/translate/v2';
    var request_params = {
      key: 'AIzaSyApd5b77jtVRZCfCAn6wzlaD52FoXeJwCw',
      source: src,
      target: trg,
      q: text
    };
    console.log(request_params);
    Meteor.http.get(request_url, {params: request_params}, function (err, res) {  
       if(err){
        console.log(err);
       } else {
         Translations.insert({
         name: name,
         translation:res.data.data.translations[0].translatedText,
         timestamp: timestamp
         });
       }
    });
  };

  Template.leftEntry.events(okCancelEvents(
    '#leftMessageBox',
    {
      ok: function (text, evt) {
        //var tag = Session.get('tag_filter');
        var nameEntry = document.getElementById('name');
        if(nameEntry.value !== ""){
          var ts = (new Date()).getTime();
          Messages.insert({
            name: nameEntry.value,
            message: text, 
            timestamp: ts
          });
          evt.target.value = '';
          translateTextLeft(nameEntry.value,text,ts);
        }
      }
  }));

  var translateTextRight = function(name, text, timestamp){
    var trgName = $('#source-select').val();
    var srcName = $('#target-select').val();
    var src = Languages.findOne({name:srcName}).language;
    var trg = Languages.findOne({name:trgName}).language;
    var request_url = 'https://www.googleapis.com/language/translate/v2';
    var request_params = {
      key: 'AIzaSyApd5b77jtVRZCfCAn6wzlaD52FoXeJwCw',
      source: src,
      target: trg,
      q: text
    };
    console.log(request_params);
    Meteor.http.get(request_url, {params: request_params}, function (err, res) {  
       if(err){
        console.log(err);
       } else {
         Messages.insert({
         name: name,
         message:res.data.data.translations[0].translatedText,
         timestamp: timestamp
         });
       }
    });
  };
  
  Template.rightEntry.events(okCancelEvents(
  '#rightMessageBox',
  {
    ok: function (text, evt) {
      //var tag = Session.get('tag_filter');
      var nameEntry = document.getElementById('name');
      if(nameEntry.value !== ""){
        var ts = (new Date()).getTime();
        Translations.insert({
          name: nameEntry.value,
          translation: text, 
          timestamp: ts
        });
        evt.target.value = '';
        translateTextRight(nameEntry.value,text,ts);
      }
    }
  }));

  
  Template.messages.messages = function(){
    return Messages.find({}, { sort: {time: 1} });
  };

  Template.translations.translations = function(){
    return Translations.find({}, { sort: {time: 1} });
  };

  Template.sourceLanguages.sourceLanguages = function(){
    return Languages.find({}, { sort: name });
  };

  Template.targetLanguages.targetLanguages = function(){
    return Languages.find({}, { sort: name });
  };
  
}

