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
    if (!props.user) return "User not available";
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

    return props.user.email || "User";
});

const fullName = computed(() => {
    if (!props.user?.profile) return "Not available";

    if (props.user.profile.getFullName) {
        return props.user.profile.getFullName() || "Not provided";
    }

    const firstName = props.user.profile.firstName || "";
    const lastName = props.user.profile.lastName || "";
    const name = `${firstName} ${lastName}`.trim();

    return name || "Not provided";
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
                        legend="User Information"
                        :toggleable="true"
                    >
                        <template #legend>
                            <div>
                                <i></i>
                                <span>User Information</span>
                            </div>
                        </template>

                        <div>
                            <!-- Basic Information -->
                            <div style="margin-bottom: 1rem;">
                                <label style="font-size: 0.875rem; margin-bottom: 0.5rem; display: block;">
                                    Email
                                </label>
                                <div>
                                    {{ user.email }}
                                </div>
                            </div>

                            <div style="margin-bottom: 1rem;">
                                <label style="font-size: 0.875rem; margin-bottom: 0.5rem; display: block;">
                                    User ID
                                </label>
                                <div>
                                    {{ user.id }}
                                </div>
                            </div>

                            <div style="margin-bottom: 1rem;">
                                <label style="font-size: 0.875rem; margin-bottom: 0.5rem; display: block;">
                                    System Role
                                </label>
                                <div>
                                    <Badge
                                        :value="user.rol"
                                        :severity="roleBadgeSeverity"
                                    />
                                </div>
                            </div>

                            <!-- Profile Information -->
                            <div v-if="user.profile">
                                <div style="margin-bottom: 1rem;">
                                    <label style="font-size: 0.875rem; margin-bottom: 0.5rem; display: block;">
                                        First Name
                                    </label>
                                    <div>
                                        {{
                                            user.profile.firstName ||
                                            "Not provided"
                                        }}
                                    </div>
                                </div>

                                <div style="margin-bottom: 1rem;">
                                    <label style="font-size: 0.875rem; margin-bottom: 0.5rem; display: block;">
                                        Last Name
                                    </label>
                                    <div>
                                        {{
                                            user.profile.lastName ||
                                            "Not provided"
                                        }}
                                    </div>
                                </div>

                                <div style="margin-bottom: 1rem;">
                                    <label style="font-size: 0.875rem; margin-bottom: 0.5rem; display: block;">
                                        Gender
                                    </label>
                                    <div>
                                        {{
                                            user.profile.gender ||
                                            "Not specified"
                                        }}
                                    </div>
                                </div>

                                <div style="margin-bottom: 1rem;">
                                    <label style="font-size: 0.875rem; margin-bottom: 0.5rem; display: block;">
                                        Full Name
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
                                    No Profile
                                </h3>
                                <p>
                                    No profile information available
                                </p>
                            </div>
                        </div>
                    </Fieldset>

                    <div v-if="user.profile?.addresses?.length" style="margin-top: 1rem;">
                        <Divider style="margin-bottom: 1rem;">
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <i class="pi pi-map-marker" style="color: var(--primary-color); font-size: 1.15rem;"></i>
                                <span style="color: var(--primary-color); font-weight: 600;">Registered Addresses</span>
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
                                                        <span style="font-weight: 600;">Address {{ index + 1 }}</span>
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
                        label="Edit Profile"
                        severity="primary"
                        size="large"
                    />
                    <Button
                        icon="pi pi-print"
                        label="Print"
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
                    <h2>User Not Available</h2>
                    <p>
                        User information has not been loaded
                    </p>
                    <Button
                        label="Reload"
                        icon="pi pi-refresh"
                        severity="secondary"
                        outlined
                    />
                </div>
            </template>
        </Card>
    </div>
</template>
