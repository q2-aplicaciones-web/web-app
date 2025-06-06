<script setup>
import { computed, ref } from "vue";
import Button from "primevue/button";
import Card from "primevue/card";
import Badge from "primevue/badge";
import Chip from "primevue/chip";
import Avatar from "primevue/avatar";
import Panel from "primevue/panel";
import Divider from "primevue/divider";
import Tag from "primevue/tag";
import DataView from "primevue/dataview";
import Fieldset from "primevue/fieldset";
import { User } from "../model/user.entity";

const props = defineProps({
    user: {
        type: User,
        default: null,
    },
});

console.log("User Info Component Props:", props.user);

const emit = defineEmits(["edit-profile"]);

const displayName = computed(() => {
    if (!props.user) return "Usuario no disponible";
    if (props.user.profile?.getFullName) {
        const fullName = props.user.profile.getFullName();
        if (fullName && fullName.trim()) {
            return fullName;
        }
    }

    if (props.user.profile?.firstName || props.user.profile?.lastName) {
        const firstName = props.user.profile.firstName || "";
        const lastName = props.user.profile.lastName || "";
        const name = `${firstName} ${lastName}`.trim();
        if (name) return name;
    }

    return props.user.email || "Usuario";
});

const fullName = computed(() => {
    if (!props.user?.profile) return "No disponible";

    if (props.user.profile.getFullName) {
        return props.user.profile.getFullName() || "No proporcionado";
    }

    const firstName = props.user.profile.firstName || "";
    const lastName = props.user.profile.lastName || "";
    const name = `${firstName} ${lastName}`.trim();

    return name || "No proporcionado";
});

const userInitials = computed(() => {
    if (!props.user) return "?";

    if (props.user.profile?.getFullName) {
        const fullName = props.user.profile.getFullName();
        if (fullName && fullName.trim()) {
            return fullName
                .split(" ")
                .filter((name) => name.length > 0)
                .map((name) => name[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
        }
    }

    if (props.user.profile?.firstName || props.user.profile?.lastName) {
        const firstName = props.user.profile.firstName || "";
        const lastName = props.user.profile.lastName || "";
        let initials = "";

        if (firstName) initials += firstName[0].toUpperCase();
        if (lastName) initials += lastName[0].toUpperCase();

        if (initials) return initials.slice(0, 2);
    }

    return props.user.email?.[0]?.toUpperCase() || "U";
});

const roleBadgeSeverity = computed(() => {
    switch (props.user?.rol) {
        case "admin":
            return "danger";
        case "manufacturer":
            return "info";
        case "customer":
            return "success";
        default:
            return "secondary";
    }
});

const roleTagSeverity = computed(() => {
    switch (props.user?.rol) {
        case "admin":
            return "danger";
        case "manufacturer":
            return "primary";
        case "customer":
            return "success";
        default:
            return "secondary";
    }
});

function handleEditProfile() {
    emit("edit-profile");
}
</script>

<template>
    <div>
        <Card v-if="user">
            <template #header>
                <div>
                    <div class="flex align-items-center justify-content-center gap-2 py-4">
                        <Avatar
                            :label="userInitials"
                            size="xlarge"
                            shape="circle"
                            style="
                                width: 120px;
                                height: 120px;
                                font-size: 2.5rem;
                                font-weight: bold;
                            "
                        />

                        <div>
                            <h1>
                                {{ displayName }}
                            </h1>
                        </div>
                    </div>
                </div>
            </template>

            <template #content>
                <div>
                    <Fieldset
                        legend="Información del Usuario"
                        :toggleable="true"
                    >
                        <template #legend>
                            <div>
                                <i></i>
                                <span>Información del Usuario</span>
                            </div>
                        </template>

                        <div>
                            <!-- Información Básica -->
                            <div style="margin-bottom: 1rem;">
                                <label style="font-size: 0.875rem; margin-bottom: 0.5rem; display: block;">
                                    Correo Electrónico
                                </label>
                                <div>
                                    {{ user.email }}
                                </div>
                            </div>

                            <div style="margin-bottom: 1rem;">
                                <label style="font-size: 0.875rem; margin-bottom: 0.5rem; display: block;">
                                    ID de Usuario
                                </label>
                                <div>
                                    {{ user.id }}
                                </div>
                            </div>

                            <div style="margin-bottom: 1rem;">
                                <label style="font-size: 0.875rem; margin-bottom: 0.5rem; display: block;">
                                    Rol del Sistema
                                </label>
                                <div>
                                    <Badge
                                        :value="user.rol"
                                        :severity="roleBadgeSeverity"
                                    />
                                </div>
                            </div>

                            <!-- Información del Perfil -->
                            <div v-if="user.profile">
                                <div style="margin-bottom: 1rem;">
                                    <label style="font-size: 0.875rem; margin-bottom: 0.5rem; display: block;">
                                        Nombre
                                    </label>
                                    <div>
                                        {{
                                            user.profile.firstName ||
                                            "No proporcionado"
                                        }}
                                    </div>
                                </div>

                                <div style="margin-bottom: 1rem;">
                                    <label style="font-size: 0.875rem; margin-bottom: 0.5rem; display: block;">
                                        Apellido
                                    </label>
                                    <div>
                                        {{
                                            user.profile.lastName ||
                                            "No proporcionado"
                                        }}
                                    </div>
                                </div>

                                <div style="margin-bottom: 1rem;">
                                    <label style="font-size: 0.875rem; margin-bottom: 0.5rem; display: block;">
                                        Género
                                    </label>
                                    <div>
                                        {{
                                            user.profile.gender ||
                                            "No especificado"
                                        }}
                                    </div>
                                </div>

                                <div style="margin-bottom: 1rem;">
                                    <label style="font-size: 0.875rem; margin-bottom: 0.5rem; display: block;">
                                        Nombre Completo
                                    </label>
                                    <div>
                                        <span>{{ fullName }}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- No Profile Available -->
                            <div v-else>
                                <Avatar
                                    icon="pi pi-user-plus"
                                    size="xlarge"
                                    style="width: 80px; height: 80px"
                                />
                                <h3>
                                    Sin Perfil
                                </h3>
                                <p>
                                    No hay información de perfil disponible
                                </p>
                            </div>
                        </div>
                    </Fieldset>

                    <div v-if="user.profile?.addresses?.length" style="margin-top: 1rem;">
                        <Divider style="margin-bottom: 1rem;">
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <i class="pi pi-map-marker" style="color: var(--primary-color); font-size: 1.125rem;"></i>
                                <span style="color: var(--primary-color); font-weight: 600;">Direcciones Registradas</span>
                                <Chip
                                    :label="user.profile.addresses.length"
                                    style="margin-left: 0.5rem;"
                                />
                            </div>
                        </Divider>

                        <DataView :value="user.profile.addresses" layout="grid">
                            <template #grid="slotProps">
                                <div style="display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">
                                    <div
                                        v-for="(
                                            address, index
                                        ) in slotProps.items"
                                        :key="address.id"
                                        style="min-height: 100%;"
                                    >
                                        <Panel style="height: 100%;">
                                            <template #header>
                                                <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                                                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                                                        <i class="pi pi-map-marker" style="color: var(--primary-color);"></i>
                                                        <span style="font-weight: 600;">Dirección {{ index + 1 }}</span>
                                                    </div>
                                                    <Tag
                                                        :label="address.id"
                                                        severity="secondary"
                                                        style="font-size: 0.75rem;"
                                                    />
                                                </div>
                                            </template>

                                            <div style="padding: 0.75rem;">
                                                <div style="display: flex; align-items: center; gap: 0.75rem;">
                                                    <Avatar
                                                        icon="pi pi-home"
                                                        size="large"
                                                    />
                                                    <div style="flex: 1;">
                                                        <p>
                                                            {{ address.formatAddress() }}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Panel>
                                    </div>
                                </div>
                            </template>
                        </DataView>
                    </div>
                </div>
            </template>

            <template #footer>
                <div>
                    <Button
                        @click="handleEditProfile"
                        icon="pi pi-user-edit"
                        label="Editar Perfil"
                        severity="primary"
                        size="large"
                    />
                    <Button
                        icon="pi pi-print"
                        label="Imprimir"
                        severity="secondary"
                        outlined
                        size="large"
                    />
                </div>
            </template>
        </Card>

        <Card v-else>
            <template #content>
                <div>
                    <Avatar
                        icon="pi pi-user-plus"
                        size="xlarge"
                        style="width: 100px; height: 100px; font-size: 2rem"
                    />
                    <h2>Usuario No Disponible</h2>
                    <p>
                        No se ha cargado la información del usuario
                    </p>
                    <Button
                        label="Recargar"
                        icon="pi pi-refresh"
                        severity="secondary"
                        outlined
                    />
                </div>
            </template>
        </Card>
    </div>
</template>
