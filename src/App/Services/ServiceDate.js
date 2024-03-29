class ServiceDate {
    dateFr;
    timeFr;

    constructor(date) {
        this.dateFr = new Date(date).toLocaleDateString("fr");

        let hours = new Date(date).getHours();
        let minutes = new Date(date).getMinutes();

        this.timeFr = `${hours}h${minutes}`;
    }
}

export default ServiceDate;