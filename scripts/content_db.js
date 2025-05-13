var currentExample; // Obecne przykładowe zdanie

// Config
var enabled = localStorage.getItem("al_enabled") != null;
var autofill = localStorage.getItem("al_autofill") != null;

// Kod przy zmianie przykładowego zdania
const usageExampleNode = document.querySelector('div.usage_example');
const usageExampleCallback = mutations => {  
  mutations.forEach(mutation => {
    if (mutation.type === 'childList') {

      currentExample = usageExampleNode.textContent.trim();
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

      updateDatabase(answerWordNode.textContent.trim());

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
    
    const enabledToggle = document.getElementById('al_enabled_toggle');
    enabledToggle.checked = enabled;
    enabledToggle.addEventListener('change', function() {
      if (this.checked) {
        enable();
      } else {
        disable();
      }
    });

    const autofillButton = document.getElementById('al_autofill');
    autofillButton.checked = autofill;
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
    
    const exportButton = document.getElementById("al_exportdata");
    const importButton = document.getElementById("al_importdata");
  
    exportButton.addEventListener("click", exportDataToFile);
    importButton.addEventListener("click", importDataFromFile);
  });

  function exportDataToFile() {
      console.log("Eksportowanie danych AutoLing...");
      let data = '';
      for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (!key) continue;
          if (key.startsWith('al_')) {console.log(key); continue;};
          const value = localStorage.getItem(key);
          data += `KEY: ${key} VALUE: ${value}\n`; 
      }

      // Zapisz do pliku
      const blob = new Blob([data], { type: 'text/plain' });
      // To serio w ten sposob trzeba pobrać lol
      const a = document.createElement('a');
      url = URL.createObjectURL(blob);
      a.href = url;
      a.download = 'AutoLing_data.txt';
      document.body.appendChild(a);
      a.click();

      URL.revokeObjectURL(url);
      document.body.removeChild(a);
  }

  // Czyta z pliku danego z elementu
  function importDataCallback(input) {
    const file = input.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {
      const fileContents = e.target.result.replace(/\r?\n/g, '\n'); // CRLF -> LF
      const lines = fileContents.split('\n');

      // Zapisanie danych w pamięci przeglądarki
      let lineCount = 0;
      let errorLineNums = [];
      for (const line of lines) {
        try {
          if (!line) continue;
          lineCount++;
          const key = line.split("KEY: ")[1].split(" VALUE: ")[0];
          const value = line.split("VALUE: ")[1];
          if (key && value) {
              localStorage.setItem(key.trim(), value.trim());
          }
        } catch (error) {
          if (errorLineNums.push(lineCount) > 5) {
            break; // Przestań importować przy zbyt dużej ilości błędów.
          }
          continue;
        }
      }
      // Error handling
      if (errorLineNums.length > 0) {
        const errorMsgVariant = errorLineNums.length > 5 ? "Przerwano importowanie słówek na linijkach "
          : "Niektóre słówka mogły nie zostać zaimportowane. Błędy wystąpiły na linijkach ";
        const errorMsg = "Podczas importowania wystąpiły błędy. " + errorMsgVariant + errorLineNums+".";
        console.error(errorMsg);
        alert(errorMsg);
      }
      // Wiadomość o skończeniu importowania
      {
      const finalMsgVariant = (() => {
        if (lineCount == 1) return "słówko.";
        if (lineCount >= 1 && lineCount <= 4) return "słówka.";
        return "słówek.";
      })();
      const finalMsg = "Sczytano "+lineCount+" "+finalMsgVariant;
      console.log(finalMsg);
      alert(finalMsg);
      }
    };
    reader.readAsText(file);
    }
    // tworzy element pozwalający na upload pliku
    function importDataFromFile() {
      console.log("Importowanie danych AutoLing...");
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.addEventListener('change', importDataCallback);
  
      document.body.appendChild(fileInput);
      fileInput.click();
      document.body.removeChild(fileInput);
  }
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
  currentExample = usageExampleNode.textContent.trim();
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