class LocalStorageUtils {

    // récupère les données depuis le local storage
    static loadData(storageName) {

        let data = []

        console.log('Chargement des données depuis le local Storage');
        const rawData = localStorage.getItem(storageName)
        try {
            // Normalise les données
            data = !JSON.parse(rawData) ? [] : JSON.parse(rawData)
        } catch (e) {
            /* si une erreur est rencontrée :
              - les données sont corrompues => on supprime le localStorage */
            localStorage.removeItem(storageName)
        }

        // retourne le tableau contenant les données demandées
        return data
    }

    // sauvegarde les données dans le local storage
    static saveData(data, storageName) {

        console.log('Enregistrement des données dans le local Storage');

        // Sérialise les données puis les enregistre
        const serialisedData = JSON.stringify(data)
        localStorage.setItem(storageName, serialisedData)
    }

}

export default LocalStorageUtils;