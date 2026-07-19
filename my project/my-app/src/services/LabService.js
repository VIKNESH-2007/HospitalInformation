let reports = [];

const labService = {

    getReports() {
        return reports;
    },

    addReport(report) {
        reports.push(report);
    },

    deleteReport(index) {
        reports.splice(index, 1);
    }

};

export default labService;