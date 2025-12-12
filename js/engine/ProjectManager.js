export default class ProjectManager {
    constructor() {
        this.projects = this.loadProjects();
    }

    loadProjects() {
        try {
            const data = localStorage.getItem('touhou_maker_projects');
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Failed to load projects", e);
            return [];
        }
    }

    saveProjects() {
        try {
            localStorage.setItem('touhou_maker_projects', JSON.stringify(this.projects));
        } catch (e) {
            console.error("Failed to save projects", e);
        }
    }

    createProject(name) {
        const project = {
            id: Date.now().toString(),
            name: name,
            created: Date.now(),
            updated: Date.now(),
            stages: [],
            deleted: false
        };
        this.projects.push(project);
        this.saveProjects();
        return project;
    }

    cloneProject(id) {
        const original = this.getProject(id);
        if (original) {
            const clone = JSON.parse(JSON.stringify(original));
            clone.id = Date.now().toString();
            clone.name = original.name + " (Copy)";
            clone.created = Date.now();
            clone.updated = Date.now();
            this.projects.push(clone);
            this.saveProjects();
            return clone;
        }
    }

    getProject(id) {
        return this.projects.find(p => p.id === id);
    }

    updateProject(project) {
        const index = this.projects.findIndex(p => p.id === project.id);
        if (index !== -1) {
            project.updated = Date.now();
            this.projects[index] = project;
            this.saveProjects();
        }
    }

    deleteProject(id) {
        const project = this.projects.find(p => p.id === id);
        if (project) {
            project.deleted = true;
            this.saveProjects();
        }
    }

    restoreProject(id) {
        const project = this.projects.find(p => p.id === id);
        if (project) {
            project.deleted = false;
            this.saveProjects();
        }
    }

    permanentlyDeleteProject(id) {
        this.projects = this.projects.filter(p => p.id !== id);
        this.saveProjects();
    }

    getAllProjects() {
        return this.projects; // Returns all, including deleted (caller filters)
    }

    getActiveProjects() {
        return this.projects.filter(p => !p.deleted);
    }

    getDeletedProjects() {
        return this.projects.filter(p => p.deleted);
    }
}
