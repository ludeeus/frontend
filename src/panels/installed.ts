import {
    LitElement,
    CSSResultArray,
    TemplateResult,
    html,
    customElement,
    css,
    property
} from "lit-element";
import { HomeAssistant } from "custom-card-helpers";

import { HacsStyle } from "../style/hacs-style"
import { Repository, Status, Configuration, RepositoryCategories, AllCategories, Route } from "../types"

import "../components/HacsBody"
import "../components/HacsProgressbar"
import { LovelaceConfig } from "../misc/LovelaceTypes"
import { AddedToLovelace } from "../misc/AddedToLovelace"
import { localize } from "../localize/localize"
import { OviewItemBuilder } from "../misc/OviewItemBuilder"

@customElement("hacs-installed")
export class HacsInstalled extends LitElement {
    @property() public hass!: HomeAssistant;
    @property() public route!: Route;
    @property() public repositories!: Repository[];
    @property() public status!: Status;
    @property() public configuration!: Configuration;
    @property() public lovelaceconfig: LovelaceConfig;

    protected render(): TemplateResult | void {
        if (this.repositories === undefined) return html`
            <hacs-progressbar></hacs-progressbar>
        `
        const builder = new OviewItemBuilder(this.configuration, this.lovelaceconfig, this.status, this.route)
        var categories: RepositoryCategories = { integrations: [], plugins: [], appdaemon_apps: [], python_scripts: [], themes: [] }

        var installed_repositories = this.repositories.filter(function (repository) {
            if (repository.installed) {
                if (repository.category === "integration") categories.integrations.push(repository);
                if (repository.category === "plugin") categories.plugins.push(repository);
                if (repository.category === "appdaemon") categories.appdaemon_apps.push(repository);
                if (repository.category === "python_script") categories.python_scripts.push(repository);
                if (repository.category === "theme") categories.themes.push(repository);
                return true;
            }
            return false;
        })

        var updatable_repositories = installed_repositories.filter(function (repository) {
            if (repository.pending_upgrade) return true;
            return false;
        })

        return html`
        <hacs-body>
            ${(updatable_repositories.length !== 0 ? html`
            <div class="card-group">
            <div class="leftspace grouptitle">
            ${localize("store.pending_upgrades")}
            </div>
                ${(updatable_repositories.sort((a, b) => (a.name, b.name) ? 1 : -1).map(repository => {
            return builder.render(repository)
        }))}
            </div>
            <hr noshade>
            ` : "")}

            ${(AllCategories.map(category => {
            if (categories[category] === undefined || categories[category].length === 0) return html``;
            return html`
                <div class="card-group">
                    <div class="leftspace grouptitle">
                    ${localize(`common.${category}`)}
                    </div>
                    ${categories[category].sort((a, b) => (a.name, b.name) ? 1 : -1).map(repository => {
                return builder.render(repository)
            })}
                </div>
                        `
        }))}
        </hacs-body>
        `
    }

    static get styles(): CSSResultArray {
        return [
            HacsStyle,
            css`
            .loader {
                background-color: var(--primary-background-color);
                height: 100%;
                width: 100%;
              }
              ha-card {
                display: inline-flex;
                cursor: pointer;
              }
              .grouptitle {
                margin-bottom: 12px;
                font-size: larger;
              }

            `]
    }
}