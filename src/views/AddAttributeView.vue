<script setup lang="ts">
import BaseButton from "@/components/BaseButton.vue";
import { useRoute } from "vue-router";
import axios from "axios";
import CardElement from "@/components/CardElement.vue";

const route = useRoute();

// Get the signedUrl param
const signedUrl = route.query.signedUrl as string;
const signature = route.query.signature as string;

const addAttribute = async () => {
  const response = await axios
    .post(signedUrl + "&signature=" + signature)
    .catch((error) => {
      console.log(error, "error");
      return error;
    });
  if (response.status === 200 || response.status === 400) {
    alert("Attribute added");
    // Redirect to the home page
    window.location.href = "/";
  } else {
    alert("Error adding attribute");
  }
};
</script>
<template>
  <card-element
    title="Add the attribute to your profile"
    subtitle="Click the button below to add the attribute to your profile."
  >
    <div>
      <base-button @click="addAttribute" style="width: 100%">{{
        $t("I have this attribute")
      }}</base-button>
      <base-button class="outline" to="/" style="width: 100%">{{
        $t("I do not have this attribute")
      }}</base-button>
    </div>
    <template #footer>
      <p>
        If you do not have this attribute, do not add it. You may be asked at
        any time to provide proof.
      </p>
    </template>
  </card-element>
</template>
