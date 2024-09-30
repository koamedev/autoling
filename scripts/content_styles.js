// Zmienia wygląd. Można spokojnie usunąć/modyfikować zawartość według potrzeb.

separator = document.createElement("div");
separator.setAttribute('style', 'height: 25px');
document.querySelectorAll('h1').forEach(element => {
    if (element.textContent === "Panel ucznia") {
        element.appendChild(separator);
    }
});;

headerText = document.querySelector('p[style="color: rgba(50,50,128,1); font-family: Ubuntu, sans-serif; font-size: 24px;"]');
removeElement(headerText);

// Usuń flagę EU lol
removeByIdList = ["euFlag", "sheet_button"];
removeByIdList.forEach(element => {
    if (element) {
        removeElement(document.getElementById(element));
    }
})

// Usuń premium/niepotrzebne przyciski
buttonTexts = ["Lista słówek", "Kartkówki", "Sprawdziany", "Klasówki"];
document.querySelectorAll('a[style="width: 200px;"]').forEach(element => {
    for (const text of buttonTexts) {
        if (element.textContent.includes(text)) {
            removeElement(element);
            break;
        }
    }
});

logo = document.querySelector('img[src="/parent/static/img/logo_instaling.png"]');
removeElement(logo);

alertElement = document.querySelector('div.alert.alert-error');
removeElement(alertElement);

atineaElement = document.querySelector('img[src="./img/atinea.png"]');
removeElement(atineaElement);

premiumLink = document.querySelector('a[href="/parent/pages/premiumPage.php"]');
removeElement(premiumLink);

versionText = document.querySelector('p[style="color: #eeeeee;"]');
removeElement(versionText);

function removeElement(element) {
    if (element)
    element.remove();
}

// Paleta kolorów:
// https://realtimecolors.com/?colors=ffffff-070809-c0cdce-0b0e0e-647f82