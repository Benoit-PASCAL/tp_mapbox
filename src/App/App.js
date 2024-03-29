// importe la config de mapbox
import config from "../../app.config.json";
// importe la library de mapbox
import mapboxgl from "mapbox-gl"
// importe le style de mapbox
import "mapbox-gl/dist/mapbox-gl.css"
// importe le style de bootstrap
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap-icons/font/bootstrap-icons.min.css"
// importe le script de bootstrap
import "bootstrap/dist/js/bootstrap.min.js"
// importe les fichiers reset et style CSS
import "../assets/reset.css"
import "../assets/style.css"

// importe les utilitaires
import LocalStorageUtils from "./Tools/LocalStorageUtils";
import LocalEvent from "./Class/LocalEvent";
import localEvent from "./Class/LocalEvent";


class App {

    // propriétés
    // conteneur de la map
    elDivMap;
    // instance de la map
    map;

    // éléments du formulaire
    elLocalEventTitle;
    elLocalEventDesc;
    elLocalEventStart;
    elLocalEventEnd;
    elLocalEventLat;
    elLocalEventLon;
    elWarningMessage;

    // fonctionnalités
    arrEvents;
    EVENT_STORAGE_NAME = config.storage.local_events.name;

    // méthode pour contrôler le bon fonctionnement de l'environnement
    test() {
        console.log("Test fonctionnel");
    }

    start() {
        console.log('App démarrée...');

        // chargement du Dom
        this.loadDom()
        this.initMap()

        // récupère les données du localStorage
        this.arrEvents = LocalStorageUtils.loadData(this.EVENT_STORAGE_NAME)

        // génère des marqueurs types si arrEvent est vide
        this.arrEvents = this.arrEvents.length === 0 ? localEvent.initSample() : this.arrEvents

        // génère les marqueurs
        this.renderMarkers()
    }

    // chargement du Dom (formulaire)
    loadDom() {
        // ************************MAP************************** //
        this.elDivMap = document.createElement('div')
        this.elDivMap.id = 'map'

        // **********************SIDEBAR************************ //
        const elFormDiv = document.createElement('div')
        elFormDiv.id = 'side-form-container'
        elFormDiv.className = 'd-flex flex-column justify-content-between'

        // FORM
        const elForm = document.createElement('form')
        elForm.className = 'd-flex flex-column gap-1'
        elForm.innerHTML = '<span class="h4">Ajouter un événement</span>'
        elFormDiv.append(elForm)


        // Titre de l'événement
        // <label for="title">Titre de l'événement</label>
        const elLocalEventTitleLabel = document.createElement('label')
        elLocalEventTitleLabel.htmlFor = 'title'
        elLocalEventTitleLabel.textContent = 'Titre de l\'événément*'
        // <input type="text" id="title"></input>
        this.elLocalEventTitle = document.createElement('input');
        this.elLocalEventTitle.id = 'title'
        this.elLocalEventTitle.type = 'text'
        this.elLocalEventTitle.className = 'form-control-sm'
        this.elLocalEventTitle.required = true;
        elForm.append(elLocalEventTitleLabel, this.elLocalEventTitle)

        // Description de l'événement
        // <label for="desc">Description de l'événement</label>
        const elLocalEventDescLabel = document.createElement('label')
        elLocalEventDescLabel.htmlFor = 'desc'
        elLocalEventDescLabel.textContent = 'Description de l\'événément'
        // <textarea id="desc" rows="5"></textarea>
        this.elLocalEventDesc = document.createElement('textarea');
        this.elLocalEventDesc.id = 'desc'
        this.elLocalEventDesc.className = 'form-control-sm'
        this.elLocalEventDesc.rows = 3
        elForm.append(elLocalEventDescLabel, this.elLocalEventDesc)

        // Dates de début et de fin
        // <label for="start">Date de début</label>
        const elLocalEventStartLabel = document.createElement('label')
        elLocalEventStartLabel.htmlFor = 'start'
        elLocalEventStartLabel.textContent = 'Date de début*'
        // <input type="datetime-local" id="start"></input>
        this.elLocalEventStart = document.createElement('input');
        this.elLocalEventStart.id = 'start'
        this.elLocalEventStart.className = 'form-control-sm'
        this.elLocalEventStart.type = 'datetime-local'
        this.elLocalEventStart.required = true;
        elForm.append(elLocalEventStartLabel, this.elLocalEventStart)

        // <label for="end">Date de fin</label>
        const elLocalEventEndLabel = document.createElement('label')
        elLocalEventEndLabel.htmlFor = 'end'
        elLocalEventEndLabel.textContent = 'Date de fin'
        // <input type="datetime-local" id="end"></input>
        this.elLocalEventEnd = document.createElement('input');
        this.elLocalEventEnd.id = 'end'
        this.elLocalEventEnd.className = 'form-control-sm'
        this.elLocalEventEnd.type = 'datetime-local'
        elForm.append(elLocalEventEndLabel, this.elLocalEventEnd)

        // Cordonnées géographiques
        // <label for="lat">Latitude</label>
        const elLocalEventLatLabel = document.createElement('label')
        elLocalEventLatLabel.htmlFor = 'lat'
        elLocalEventLatLabel.textContent = 'Latitude*'
        // <input type="number" id="lat"></input>
        this.elLocalEventLat = document.createElement('input');
        this.elLocalEventLat.id = 'lat'
        this.elLocalEventLat.className = 'form-control-sm'
        this.elLocalEventLat.type = 'number'
        this.elLocalEventLat.step = 0.00001
        this.elLocalEventLat.required = true;
        elForm.append(elLocalEventLatLabel, this.elLocalEventLat)

        // <label for="long">Longitude</label>
        const elLocalEventLonLabel = document.createElement('label')
        elLocalEventLonLabel.htmlFor = 'long'
        elLocalEventLonLabel.textContent = 'Longitude*'
        // <input type="number" id="long"></input>
        this.elLocalEventLon = document.createElement('input');
        this.elLocalEventLon.id = 'long'
        this.elLocalEventLon.className = 'form-control-sm'
        this.elLocalEventLon.type = 'number'
        this.elLocalEventLon.step = 0.00001
        this.elLocalEventLon.required = true;
        elForm.append(elLocalEventLonLabel, this.elLocalEventLon)

        // Bouton valider : Ajouter l'événement
        // <button type="button" method="POST">
        const elButtonNewLocalEvent = document.createElement('button')
        elButtonNewLocalEvent.type = 'submit'
        elButtonNewLocalEvent.className = 'btn btn-success my-2'
        elButtonNewLocalEvent.textContent = 'Ajouter'
        elForm.addEventListener("submit", this.handleClickAddLocalEvent.bind(this))
        elForm.append(elButtonNewLocalEvent)

        // Message d'erreur
        this.elWarningMessage = document.createElement('span')
        this.elWarningMessage.className = 'alert alert-warning mt-0 p-2 d-none'
        elForm.append(this.elWarningMessage)


        // Bouton : Supprimer tous les événements
        const elDeleteAllBtn = document.createElement('button')
        elDeleteAllBtn.type = 'button'
        elDeleteAllBtn.className = 'btn btn-outline-danger my-2'
        elDeleteAllBtn.textContent = 'Supprimer tous les événements'
        elDeleteAllBtn.addEventListener("click", this.handleClickDeleteAll.bind(this))
        elFormDiv.append(elDeleteAllBtn)

        // *********************UPDATEBTN*********************** //
        const elUpdateBtn = document.createElement('button')
        elUpdateBtn.type = 'button'
        elUpdateBtn.className = 'btn btn-info m-2 update-btn'
        elUpdateBtn.textContent = 'Mettre à jour'
        elUpdateBtn.addEventListener("click", this.handleClickUpdate.bind(this))


        document.body.append(this.elDivMap, elFormDiv, elUpdateBtn)


    }

    // initialisation de la Map depuis mapbox
    initMap() {
        // initialiser la map
        // on récupère la clé d'api dans le fichier de config
        mapboxgl.accessToken = config.apis.mapbox_gl.api_key;

        // on instancie la map
        this.map = new mapboxgl.Map({
            container: 'map', // container ID
            style: config.apis.mapbox_gl.map_styles.streets, // style URL
            center: [2.91, 42.69], // starting position [lng, lat]
            zoom: 12 // starting zoom
        });

        const nav = new mapboxgl.NavigationControl();
        this.map.addControl(nav, 'bottom-left');

        this.map.on('click', this.handleClickMap.bind(this));
    }

    // rendu des marqueurs
    renderMarkers() {


        for (let localEventLiteral of this.arrEvents) {
            const localEvent = new LocalEvent(localEventLiteral)
            localEvent.getMarker().addTo(this.map)
        }

        // sauvegarde des données dans le local storage
        this.saveEvents()
    }

    // méthode qui capte le clic sur la map
    handleClickMap(evt) {
        console.log(evt);

        // Récupération des données du click et insertion dans le formulaire
        this.elLocalEventLat.value = evt.lngLat.lat.toFixed(5);
        this.elLocalEventLon.value = evt.lngLat.lng.toFixed(5);

    }

    // gestion du clic sur le bouton "Ajouter"
    handleClickAddLocalEvent(evt) {
        evt.preventDefault();
        console.log(evt);

        // variable de contrôle du bon remplissage du formulaire
        let formComplete = false

        // contrôle du format des dates
        const regexDateTime = /^(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])T([01][0-9]|2[0-3]):([0-5][0-9])$/;
        const regexLatlng = /^\d+(\.\d{1,5})?$/

        // contrôle du formulaire
        // contrôle de la présence des données
        this.elLocalEventTitle.value.trim() === "" ?
            this.elWarningMessage.textContent = "Titre manquant"
            : this.elLocalEventStart.value === "" ?
                this.elWarningMessage.textContent = "Date de début manquante"
                : this.elLocalEventLat.value === "" || this.elLocalEventLon.value === "" ?
                    this.elWarningMessage.textContent = "Coordonnées manquantes"
                    // contrôle du format des dates
                    : !regexDateTime.test(this.elLocalEventStart.value) ?
                        this.elWarningMessage.textContent = "Date de début incorrecte"
                        : this.elLocalEventEnd.value !== "" && !regexDateTime.test(this.elLocalEventEnd.value) ?
                            this.elWarningMessage.textContent = "Date de fin incorrecte"
                            // contrôle de l'ordre des dates
                            : this.elLocalEventEnd.value !== "" && this.elLocalEventEnd.value <= this.elLocalEventStart.value ?
                                this.elWarningMessage.textContent = "Ordre des dates incorrect"
                                // contrôle du format des coordonnées
                                : !regexLatlng.test(this.elLocalEventLat.value) || !regexLatlng.test(this.elLocalEventLat.value) ?
                                    this.elWarningMessage.textContent = "Format des coordonnées incorrecte"
                                    // contrôle de l'existence des coordonnées
                                    : Math.abs(this.elLocalEventLat.value) > 90 || Math.abs(this.elLocalEventLon.value) > 180 ?
                                        this.elWarningMessage.textContent = "Coordonnées inexistantes sur Terre"
                                        : (formComplete = true, console.log('ok'))

        // si les données du formulaire sont correctes
        if (formComplete) {
            // masque le message d'erreur
            this.elWarningMessage.classList.add('d-none')

            // création de l'objet littéral
            const localEventLiteral = {
                title: this.elLocalEventTitle.value.trim(),
                desc: this.elLocalEventDesc.value.trim(),
                start: this.elLocalEventStart.value,
                end: this.elLocalEventEnd.value,
                lat: parseFloat(this.elLocalEventLat.value).toFixed(5),
                lon: parseFloat(this.elLocalEventLon.value).toFixed(5)
            }

            // suppression des valeurs renseignées dans le formulaire (à l'affichage)
            this.elLocalEventTitle.value = '';
            this.elLocalEventDesc.value = '';
            this.elLocalEventStart.value = '';
            this.elLocalEventEnd.value = '';
            this.elLocalEventLat.value = '';
            this.elLocalEventLon.value = '';

            // ajout de l'objet LocalEvent dans la liste associée
            this.arrEvents.push(new LocalEvent(localEventLiteral))

            // affichage des marqueurs
            this.renderMarkers()
            console.log(localEventLiteral);
        } else {
            // affiche le message d'erreur
            this.elWarningMessage.classList.remove('d-none')
        }


    }

    // met à jour les marqueurs de la carte
    handleClickUpdate() {
        console.log("Mise à jour des événements");

        this.clearMap()
        this.renderMarkers()
    }

    // gestion du clic sur le bouton "Supprimer tout"
    handleClickDeleteAll() {
        console.log("Suppression de tous les événements");

        this.clearMap()

        // supprime les marqueurs de la liste
        this.arrEvents = []
        this.renderMarkers()
    }

    // sauvegarde des événements dans le local storage
    saveEvents() {
        LocalStorageUtils.saveData(this.arrEvents, this.EVENT_STORAGE_NAME)
    }

    // efface les marqueurs affichés sur la carte
    clearMap() {

        // récupère la liste des marqueurs affichés
        const elMarkersList = this.elDivMap.querySelectorAll('.mapboxgl-marker')
        // récupère l'élément contenant les marqueurs
        const elMarkerContainer = this.elDivMap.querySelector('canvas').parentElement

        // supprime les marqueurs
        for (let elMarker of elMarkersList) {
            elMarkerContainer.removeChild(elMarker)
        }
    }

}

const app = new App();

export default app;