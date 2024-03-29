// importe la library de mapbox
import mapboxgl from "mapbox-gl"
import ServiceDate from "../Services/ServiceDate";

class LocalEvent {
    // déclaration des propriétés
    title;
    desc;
    start;
    end;
    lat;
    lon;

    // déclaration des données pour l'affichage personnalisé
    stampNow;
    timeToEvent;
    color;
    warningMessage;

    // déclaration de la variable pour le marqueur
    marker;
    elMarker;
    elEventResume;
    elPopup;

    // déclaration d'une variable pour personnaliser l'affichage de la date
    dateContent;

    constructor(LocalEventLiteral) {
        this.title = LocalEventLiteral.title;
        this.desc = LocalEventLiteral.desc;
        this.start = LocalEventLiteral.start;
        this.end = LocalEventLiteral.end;
        this.lat = LocalEventLiteral.lat;
        this.lon = LocalEventLiteral.lon;
    }

    // construit du marqueur de l'événement
    getMarker() {

        // calcule le temps à venir avant l'événement
        const stampStartEvent = Date.parse(this.start);
        const stampEndEvent = Date.parse(this.end);
        this.stampNow = Date.now();
        this.timeToEvent = (stampStartEvent - this.stampNow) / 3600000 / 24
        this.timeToEnd = (stampEndEvent - this.stampNow) / 3600000 / 24
        const daysLeft = Math.floor(this.timeToEvent);
        const hoursLeft = Math.floor((this.timeToEvent - Math.floor(this.timeToEvent)) * 24);

        // Définie la couleur de la punaise en fonction de la date + Le message personnalisé
        if (this.timeToEnd < 0 || (this.end === "" && this.timeToEvent < 0)) {
            // si la date de fin est dépassée
            // ou s'il n'y a pas de date de fin et que la date de début est dépassée
            this.color = 'red';
            this.warningMessage = 'Quel dommage ! Vous avez raté cet événement !'
        } else if (this.timeToEvent < 0) {
            // si la date de début est dépassée (mais que la date de fin n'est pas dépassée)
            this.color = 'blue';
        } else if (this.timeToEvent < 3) {
            // si la date de début est dans les trois prochains jours
            // la date de fin ne peut pas être dépassée si l'événement n'a pas commencé
            this.color = 'orange';
            this.warningMessage = `Attention, commence dans ${daysLeft} jours et ${hoursLeft} heures`
        } else {
            // sinon (si la date de début est dans plus de trois jours)
            // la date de fin ne peut pas être dépassée si l'événement n'a pas commencé
            this.color = 'green';
        }

        const dateServiceStart = new ServiceDate(this.start)
        const dateServiceEnd = new ServiceDate(this.end)

        // Définie le texte de la date en fonction de la présence ou non d'une date de fin
        if (this.end === "") {
            this.dateContent = `Le ${dateServiceStart.dateFr} à ${dateServiceStart.timeFr}`
        } else if (dateServiceStart.dateFr === dateServiceEnd.dateFr) {
            this.dateContent = `Le ${dateServiceStart.dateFr} de ${dateServiceStart.timeFr} à ${dateServiceEnd.timeFr}`
        } else {
            this.dateContent = `Du ${dateServiceStart.dateFr} (${dateServiceStart.timeFr}) au ${dateServiceEnd.dateFr} (${dateServiceEnd.timeFr})`
        }

        // Création du marqueur
        this.marker = new mapboxgl.Marker({
            draggable: false,
            color: this.color
        })
        this.marker.setLngLat([this.lon, this.lat])
        this.elMarker = this.marker.getElement()

        // Ajoute un événement au survol pour afficher le titre et les dates
        // élément comprenant les informations principales
        this.elEventResume = document.createElement('div')
        this.elEventResume.textContent = `${this.title} - ${this.dateContent}`
        this.elEventResume.className = 'd-none event-resume';
        this.elMarker.append(this.elEventResume)

        this.elMarker.addEventListener("mouseenter", this.handleHover.bind(this))
        this.elMarker.addEventListener("mouseleave", this.handleLeave.bind(this))


        // Ajouter un événement au click pour afficher les informations de l'événement
        this.marker.setPopup(new mapboxgl.Popup().setHTML(this.getPopupDom().outerHTML))

        this.elMarker.addEventListener("click", this.handleClick.bind(this))


        return this.marker
    }

    handleHover() {
        this.elEventResume.classList.remove("d-none");
    }

    handleLeave() {
        this.elEventResume.classList.add("d-none");
    }

    handleClick() {
        this.marker.togglePopup()
    }

    getPopupDom() {
        this.elPopup = document.createElement('div')
        this.elPopup.className = 'd-flex flex-column'
        this.elPopup.innerHTML = `<span class="h4 alert my-2 p-2">${this.title}</span>`

        const elDateDiv = document.createElement('div')
        elDateDiv.className = 'alert alert-secondary mb-2 p-2';
        elDateDiv.textContent = this.dateContent

        const elDetails = document.createElement('div')
        elDetails.className = 'alert alert-secondary mb-2 p-2';
        elDetails.innerHTML = `Détails : ${this.desc}`
        if (this.desc === "") elDetails.classList.add("d-none")

        const elCoords = document.createElement('div')
        elCoords.className = 'small text-end mt-2'
        elCoords.innerHTML = `Coordonnées : ${this.lat}, ${this.lon}`

        this.elPopup.append(elDateDiv, elDetails)
        if (this.warningMessage) {
            const elWarningMessage = document.createElement('span')
            elWarningMessage.textContent = this.warningMessage
            elWarningMessage.className = 'alert alert-warning my-2 p-2'
            this.elPopup.append(elWarningMessage)
        }
        this.elPopup.append(elCoords)


        return this.elPopup
    }

    static initSample() {

        console.log("Création des événements d'exemples");

        // calcul du timeStamp actuel pour la méthode statique
        let stampNow = Date.now();

        // calcul le décalage avec le temps UTC
        const timeZoneOffSet = new Date(stampNow).getTimezoneOffset() * 60000

        // génère les dates pour les événements
        // J+1
        const todayPlusOne = new Date(stampNow - timeZoneOffSet + (3600 * 24 * 1000)).toISOString().slice(0, 16);
        // J+1 + 1 heure
        const todayPlusOneAndHour = new Date(stampNow - timeZoneOffSet + (3600 * 25 * 1000)).toISOString().slice(0, 16);
        // J+5
        const todayPlusFive = new Date(stampNow - timeZoneOffSet + (3600 * 24 * 1000 * 5)).toISOString().slice(0, 16);
        // J-1
        const todayMinusOne = new Date(stampNow - timeZoneOffSet - (3600 * 24 * 1000)).toISOString().slice(0, 16);

        // crée les événements exemple à partir
        // les dates calculées permettent de faire fonctionner les affichages associés
        return [
            {
                "title": "Concert",
                "desc": "Vatoire",
                "start": "2023-06-17T07:23",
                "end": "",
                "lat": "42.69794",
                "lon": "2.89081"
            },
            {
                "title": "Evénement ponctuel",
                "desc": "Evénement sans date de fin.",
                "start": `${todayPlusOne}`,
                "end": "",
                "lat": "42.69087",
                "lon": "2.87828"
            },
            {
                "title": "Evénement court",
                "desc": "Evénement sur une seule journée, la date ne s'affiche qu'une fois et inclus l'heure de début et de fin",
                "start": `${todayPlusOne}`,
                "end": `${todayPlusOneAndHour}`,
                "lat": "42.69175",
                "lon": "2.89133"
            },
            {
                "title": "Evénement long",
                "desc": "Evénement sur plusieurs journées, les deux dates s'affichent",
                "start": `${todayPlusOne}`,
                "end": `${todayPlusFive}`,
                "lat": "42.69188",
                "lon": "2.90704"
            },
            {
                "title": "Evenement raté",
                "desc": "",
                "start": `${todayMinusOne}`,
                "end": "",
                "lat": "42.68116",
                "lon": "2.88540"
            },
            {
                "title": "Evénement proche",
                "desc": "",
                "start": `${todayPlusOne}`,
                "end": `${todayPlusFive}`,
                "lat": "42.70917",
                "lon": "2.91391"
            },
            {
                "title": "Evénement à venir",
                "desc": "",
                "start": `${todayPlusFive}`,
                "end": "",
                "lat": "42.71561",
                "lon": "2.89283"
            },
            {
                "title": "Evénement en cours",
                "desc": "",
                "start": `${todayMinusOne}`,
                "end": `${todayPlusOne}`,
                "lat": "42.71561",
                "lon": "2.90283"
            }
        ]
    }
}

export default LocalEvent;