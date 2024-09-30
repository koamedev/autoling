var currentExample; // Obecne przykładowe zdanie

// Config
var enabled = localStorage.getItem("al_enabled") != null;
var autofill = localStorage.getItem("al_autofill") != null;

// Kod przy zmianie przykładowego zdania
const usageExampleNode = document.querySelector('div.usage_example');
const usageExampleCallback = mutations => {  
  mutations.forEach(mutation => {
    if (mutation.type === 'childList') {

      currentExample = usageExampleNode.textContent;
      updateHint();
      injectAnswerFromHint();

    }
  });
}

// Kod po sprawdzeniu odpowiedzi
const answerWordNode = document.getElementById('word');
const answerWordCallback = mutations => {  
  mutations.forEach(mutation => {
    if (mutation.type === 'childList') {

      updateDatabase(answerWordNode.textContent);

    }
  });
 }

// Obserwują zmiany
const observerUsageExample = new MutationObserver(usageExampleCallback);
const observerAnswerWord = new MutationObserver(answerWordCallback);


function getHintFromExample(example) {
  return localStorage.getItem(example);
}

function updateDatabase(answer) {
  localStorage.setItem(currentExample, answer);
}

// Aktualizuje tekst podpowiedzi
function updateHint() {
  hintText.textContent = getHintFromExample(currentExample);
}

const textInputElement = document.getElementById('answer');

function injectAnswer(answer) {
  // Wysyła event kliknięcia. Prawdopodobnie zbędne ale nie szkodzi.
  const clickEvent = new Event('click', {bubbles: true, cancelable: true});
  textInputElement.dispatchEvent(clickEvent);
  textInputElement.focus();

  textInputElement.value = answer; // To cała magia btw
  
  const event = new Event('input', {bubbles: true, cancelable: true});
  textInputElement.dispatchEvent(event);
}

function injectAnswerFromHint() {
  if (!autofill) return;
  hint = getHintFromExample(currentExample);
  if (hint) injectAnswer(hint);
}

// Ekran konfiguracji
{
  fetch(chrome.runtime.getURL('/conf.html')).then(r => r.text()).then(html => {
    document.body.insertAdjacentHTML('beforeend', html);
    
    enabledToggle = document.getElementById('al_enabled_toggle');
    enabledToggle.checked = enabled;
    enabledToggle.addEventListener('change', function() {
      if (this.checked) {
        enable();
      } else {
        disable();
      }
    });

    autofillButton = document.getElementById('al_autofill');
    autofillButton.checked = enabled;
    autofillButton.addEventListener('change', function() {
      if (this.checked) {
        autofill = true;
        localStorage.setItem("al_autofill", "yes");
        injectAnswerFromHint();
      } else {
        autofill = false;
        localStorage.removeItem("al_autofill");
      }
    });
  });
}


 function enable() {
  console.log("AutoLing enabled.")
  localStorage.setItem("al_enabled", "yes");
  enabled = true;
  
  // Connect observers
  observerUsageExample.observe(usageExampleNode, {childList: true});
  observerAnswerWord.observe(answerWordNode, {childList: true});
  
  // Dodanie elementu z podpowiedzia
  questionElement = document.getElementById("question");
  hintDiv = document.createElement("div");
  hintDiv.id = "al_hint";
  hintText = document.createTextNode("*HINT*");
  questionElement.appendChild(hintDiv);
  hintDiv.appendChild(hintText);

  // zupdate'owanie elementu
  currentExample = usageExampleNode.textContent;
  updateHint();
  injectAnswerFromHint();
}

function disable() {
  console.log("AutoLing disabled.")
  localStorage.removeItem("al_enabled");
  enabled = false;
  document.getElementById('al_hint').remove();

  // Disconnect observers
  observerUsageExample.disconnect();
  observerAnswerWord.disconnect();
}


if (enabled) enable();