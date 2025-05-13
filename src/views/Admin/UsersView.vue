<script lang="ts" setup>
import { computed, h, ref, watch } from "vue";
import type { User } from "@/types/user";
import AttributeDropdown from "@/components/AttributeDropdown.vue";
import MapComponent from "@/components/MapComponent.vue";
import { relativeRealtime, relativeTime } from "@/helpers/relativeRealtime";
import { createColumnHelper } from "@tanstack/vue-table";
import BaseButton from "@/components/BaseButton.vue";
import DataTable from "@/components/DataTable.vue";
import ApiClient from "@/api/client";

const users = ref<User[]>([]);
const attributeIds = ref<string[]>([]);

const fetchUsers = async () => {
  const response = await ApiClient.get("/api/users", {
    params: {
      attributes: attributeIds.value,
    },
  });
  users.value = response.data;
};

const columnHelper = createColumnHelper<User>();

const verifyGuideProfile = async (id: number | undefined) => {
  if (!id) {
    return;
  }
  const response = await ApiClient.post(`/api/guide-profiles/${id}/verify`);
  if (response.data) {
    alert("Guide profile verified");
    fetchUsers();
  }
};

const updateUsersAttributes = async (
  userId: number | undefined,
  newAttributeIds: string[]
) => {
  if (!userId) {
    return;
  }
  await ApiClient.put(`/api/users/${userId}/attributes`, {
    attributeIds: newAttributeIds,
  });

  // Refresh the users list
  await fetchUsers();
};

watch(
  attributeIds,
  () => {
    fetchUsers();
  },
  { immediate: true }
);

const userMarkers = computed(() => {
  return users.value
    .filter((user) => user.latest_location)
    .map((user: Omit<User, "latest_location"> & { latest_location: any }) => ({
      latitude: user.latest_location.latitude,
      longitude: user.latest_location.longitude,
      markerName:
        (user.name ?? user.email) +
        " (" +
        relativeRealtime(user.latest_location.created_at) +
        ")",
    }));
});
</script>
<template>
  <h1>{{ users.length }} {{ $t("Users") }}</h1>
  <details v-if="userMarkers.length">
    <summary>{{ $t("Map") }}</summary>
    <map-component
      class="full-width"
      :markers="userMarkers"
      :showOpenInGoogleMaps="false"
    />
  </details>
  <attribute-dropdown v-model="attributeIds"></attribute-dropdown>

  <data-table
    :data="users"
    :columns="[
      {
        value: 'id',
        type: 'string',
      },
      {
        value: 'gravatar',
        type: 'img',
      },
      {
        value: 'name',
        type: 'string',
      },
      {
        value: 'surname',
        type: 'string',
      },
      {
        value: 'email',
        type: 'string',
      },
      {
        value: 'phone',
        type: 'string',
      },
      {
        value: 'phone_country_code',
        type: 'string',
      },
      {
        value: 'referral_code',
        type: 'string',
      },
      {
        value: 'email_verified_at',
        type: 'date',
      },
      {
        value: 'phone_verified_at',
        type: 'date',
      },
      {
        value: 'last_seen_at',
        type: 'date',
      },
      {
        value: 'created_at',
        type: 'date',
      },
      {
        value: 'updated_at',
        type: 'date',
      },
      {
        value: 'potential_earnings_from_referrals',
        type: 'string',
      },
      {
        value: 'earnings',
        type: 'string',
      },
      {
        value: 'latitude',
        type: 'string',
      },
      {
        value: 'longitude',
        type: 'string',
      },
      {
        value: 'latest_cv_status',
        type: 'string',
      },

      // Attributes need to be passed as a raw ColumnDef
      {
        type: 'raw',
        value: columnHelper.accessor('model_attributes_pivot', {
          header: 'Attributes',
          cell: (info) => {
            return h(AttributeDropdown, {
              // Min width of 296px
              style: { minWidth: '296px' },
              modelValue: info
                .getValue()
                ?.map((attr: any) => attr.attribute_id.toString()),
              'onUpdate:modelValue': (newAttributeIds: string[]) => {
                updateUsersAttributes(info.row.original.id, newAttributeIds);
              },
            });
          },
          footer: (props) => props.column.id,
        }),
      },

      {
        type: 'raw',
        value: columnHelper.accessor('guide_profile.verified_at', {
    header: 'Verified guide profile',
    cell: (info) => {
      const isVerified = info.getValue();
      if (isVerified) {
        return relativeTime(isVerified);
      }
      return h(
        BaseButton,
        {
          onClick: () => verifyGuideProfile(info.row.original.id),
        },
        () => ['Verify']
      );
    },
    footer: (props) => props.column.id,
  }),
      }
    ]"
  />
</template>
<style scoped>
th {
  position: sticky;
  top: 0;
}
table {
  position: relative;
  border-collapse: collapse;
}
</style>
