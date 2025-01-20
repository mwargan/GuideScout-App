<script lang="ts">
import i18n from "@/locales/i18n";
const t = i18n.global.t;
</script>
<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import BaseButton from "@/components/BaseButton.vue";
import { useUserStore } from "@/stores/user";
import router from "@/router";

const userStore = useUserStore();

const steps = [
  { title: "What’s your name?", subtitle: "Hey there, guide!" },
  {
    title: "What city do you want to guide in?",
    subtitle: "Tell us about your preferences.",
  },
  { title: "What languages can you speak?", subtitle: "Tell us about you." },
  { title: "What are your qualifications?", subtitle: "Tell us about you." },
  {
    title: "How can you be reached?",
    subtitle: "Finish setting up your GuideScout account.",
  },
];

const currentStep = ref(0);

const emit = defineEmits(["success", "stepChange"]);

const formData = reactive({
  name: "",
  surname: "",
  city: "",
  languages: [],
  qualifications: [],
  email: "",
  phone: "",
  referral: router.currentRoute.value.query.referral as string,
});

const formErrors = reactive({
  name: false,
  surname: false,
  city: false,
  languages: false,
  qualifications: false,
  email: false,
  phone: false,
  invalidEmail: false,
  invalidPhone: false,
  referral: false,
});

const languages = ["English", "Spanish", "French", "German", "Italian"];
const qualifications = [
  "First Aid Certificate",
  "Car (B) Driving Licence",
  "PADI Dive Master Certification",
  "Tour Guide Certification",
  "Tourism Degree",
];

const isLastStep = computed(() => currentStep.value === steps.length - 1);

const handleSubmit = async () => {
  // if not last step, increment currentStep
  if (!isLastStep.value) {
    currentStep.value++;
    emit("stepChange", {
      stepData: steps[currentStep.value],
      currentStep: currentStep.value,
      totalSteps: steps.length,
    });
    return;
  }

  console.log("Submitting form data");

  // if last step, submit form data
  const response = await userStore.register(
    formData.email,
    null,
    formData.name,
    formData.surname,
    formData.phone,
    formData.city,
    formData.languages,
    formData.qualifications,
    formData.referral
  );

  console.log(response, "got resp");

  if (response !== true) {
    console.error("Error submitting form data");
    alert("Error submitting form data");
    return;
  }
  console.log("Form data submitted successfully");
  emit("success");
};

onMounted(() => {
  emit("stepChange", {
    stepData: steps[currentStep.value],
    currentStep: currentStep.value,
    totalSteps: steps.length,
  });
});
</script>

<template>
  <form
    method="POST"
    id="sign-up"
    class="needs-validation"
    action="#"
    name="sign-up"
    novalidate
    @submit.prevent="handleSubmit"
  >
    <!-- Step 1: First Name and Surname -->
    <fieldset :class="{ hidden: currentStep !== 0 }">
      <label for="name">First Name</label>
      <input
        type="text"
        placeholder="First Name"
        required
        name="name"
        v-model="formData.name"
        autofocus
        autocomplete="given-name"
      />
      <div v-if="formErrors.name">Please provide your first name.</div>

      <label for="surname">Surname</label>
      <input
        type="text"
        placeholder="Surname"
        required
        name="surname"
        v-model="formData.surname"
        autocomplete="family-name"
      />
      <div v-if="formErrors.surname">Please provide your surname.</div>
    </fieldset>

    <!-- Step 2: City -->
    <fieldset :class="{ hidden: currentStep !== 1 }">
      <label for="city" class="sr-only">City</label>
      <input
        type="text"
        placeholder="City"
        required
        name="city"
        v-model="formData.city"
      />
      <div v-if="formErrors.city">
        Please provide the city you want to guide in.
      </div>
    </fieldset>

    <!-- Step 3: Languages -->
    <fieldset :class="{ hidden: currentStep !== 2 }">
      <label for="languages" class="sr-only">Languages</label>
      <div class="flex flex-wrap gap-2 flex-col">
        <label v-for="language in languages" :key="language">
          <input
            type="checkbox"
            :value="language"
            v-model="formData.languages"
            class="mr-2"
          />
          {{ language }}
        </label>
      </div>
      <div v-if="formErrors.languages">
        Please select at least one language.
      </div>
    </fieldset>

    <!-- Step 4: Qualifications -->
    <fieldset :class="{ hidden: currentStep !== 3 }">
      <label for="qualifications" class="sr-only">Qualifications</label>
      <div class="flex flex-wrap gap-2 flex-col">
        <label v-for="qualification in qualifications" :key="qualification">
          <input
            type="checkbox"
            :value="qualification"
            v-model="formData.qualifications"
            class="mr-2"
          />
          {{ qualification }}
        </label>
      </div>
      <div v-if="formErrors.qualifications">
        Please select at least one qualification.
      </div>
    </fieldset>

    <!-- Step 5: Contact Info -->
    <fieldset :class="{ hidden: currentStep !== 4 }">
      <label for="email_address">Email Address</label>
      <input
        id="email_address"
        type="email"
        placeholder="Email Address"
        name="email"
        v-model="formData.email"
        required
      />
      <div
        class="empty-feedback text-red-400 text-sm mt-1"
        v-if="formErrors.email"
      >
        Please provide your email address.
      </div>
      <div
        class="invalid-feedback text-red-400 text-sm mt-1"
        v-if="formErrors.invalidEmail"
      >
        Please provide a valid email address.
      </div>

      <label for="phone_number">{{
        $t("Phone Number (starting with +)")
      }}</label>
      <input
        id="phone_number"
        type="tel"
        placeholder="Phone Number"
        name="phone"
        v-model="formData.phone"
        required
        pattern="^\+[0-9]{1,15}$"
        minlength="7"
        maxlength="16"
        inputmode="tel"
        autocomplete="tel"
      />
      <div
        class="empty-feedback text-red-400 text-sm mt-1"
        v-if="formErrors.phone"
      >
        Please provide your phone number.
      </div>
      <div
        class="invalid-feedback text-red-400 text-sm mt-1"
        v-if="formErrors.invalidPhone"
      >
        Please provide a valid phone number.
      </div>
    </fieldset>

    <BaseButton type="submit" :id="'next'">{{
      isLastStep ? $t("Sign up") : $t("Next")
    }}</BaseButton>
    <a href="/login" class="mt-1 underline">Already have an account?</a>
  </form>
</template>

<style scoped>
form {
  display: grid;
  grid-template-rows: 1fr auto;
  min-height: 70svh;
}
</style>
