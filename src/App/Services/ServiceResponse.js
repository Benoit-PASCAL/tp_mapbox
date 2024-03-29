class ServiceResponse {
    ok;
    error;
    data;

    constructor(ok, error, data) {
        this.ok = ok;
        this.error = error;
        this.data = data;
    }
}

export default ServiceResponse;