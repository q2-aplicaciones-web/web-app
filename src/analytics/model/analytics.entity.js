export class Analytics {
    constructor({ user_id, total_projects, blueprints, designed_garments, completed }) {
        this.userId = user_id;
        this.totalProjects = total_projects;
        this.blueprints = blueprints;
        this.designedGarments = designed_garments;
        this.completed = completed;
    }
}
