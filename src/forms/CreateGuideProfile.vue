<script lang="ts">
import i18n from "@/locales/i18n";
import type { Attribute } from "@/types/tour";
import { getAttributes } from "@/api/attribute";
import { postParseCv } from "@/api/me";
const t = i18n.global.t;
</script>
<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import BaseButton from "@/components/BaseButton.vue";
import { useUserStore } from "@/stores/user";
import router from "@/router";

const userStore = useUserStore();

const steps = [
  {
    title: "Welcome to GuideScout! Start with a CV",
    subtitle: "Let's get you started on your journey.",
  },
  { title: "What’s your name?", subtitle: "Hey there, guide!" },
  {
    title: "What city do you want to guide in?",
    subtitle: "Tell us about your preferences.",
  },
  { title: "What languages can you speak?", subtitle: "Tell us about you." },
  { title: "What are your qualifications?", subtitle: "Tell us about you." },
  {
    title: "What certifications do you have?",
    subtitle: "Tell us about you.",
  },
  { title: "What are your skills?", subtitle: "Tell us about you." },
  {
    title: "Do you have at least 1 year experience in these?",
    subtitle: "Tell us about you.",
  },
  {
    title: "Share a link to a review you got on the web.",
    subtitle: "Share your experience.",
  },
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
  languages: [] as string[],
  qualifications: [] as string[],
  certifications: [] as string[],
  skills: [] as string[],
  experiences: [] as string[],
  email: "",
  phone: "",
  referral: router.currentRoute.value.query.referral as string,
  external_review_url: null as string | null,
});

const formErrors = reactive({
  name: false,
  surname: false,
  city: false,
  languages: false,
  qualifications: false,
  certifications: false,
  skills: false,
  experiences: false,
  email: false,
  phone: false,
  invalidEmail: false,
  invalidPhone: false,
  referral: false,
  external_review_url: false,
});

const languages = computed(() => {
  return allAttributes.value
    ?.filter((attribute) => attribute.type === "language")
    .map((attribute) => attribute.name);
});

const qualifications = computed(() => {
  return allAttributes.value
    ?.filter((attribute) => attribute.type === "qualification")
    .map((attribute) => attribute.name);
});

const certifications = computed(() => {
  return allAttributes.value
    ?.filter((attribute) => attribute.type === "certification")
    .map((attribute) => attribute.name);
});

const skills = computed(() => {
  return allAttributes.value
    ?.filter((attribute) => attribute.type === "skill")
    .map((attribute) => attribute.name);
});

const experiences = computed(() => {
  return allAttributes.value
    ?.filter((attribute) => attribute.type === "experience")
    .map((attribute) => attribute.name);
});

const isLastStep = computed(() => currentStep.value === steps.length - 1);

const allAttributes = ref<Attribute[] | null>(null);

const getAllAttributes = async () => {
  const attributes = await getAttributes();
  return attributes.filter((attribute: Attribute) => {
    // Filtering the one that contains the word Test
    return !attribute.name.toLowerCase().includes("test");
  });
};

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
    formData.certifications,
    formData.skills,
    formData.experiences,
    formData.external_review_url,
    formData.referral
  );

  console.log(response, "got resp");

  if (response !== true) {
    console.error("Error submitting form data", response);
    alert("Error submitting form data - " + response?.data?.message);
    // Go to first step
    currentStep.value = 1;
    emit("stepChange", {
      stepData: steps[currentStep.value],
      currentStep: currentStep.value,
      totalSteps: steps.length,
    });
    return;
  }
  console.log("Form data submitted successfully");
  // If we have a CV file, upload it
  if (cvFile.value) {
    try {
      const response = await userStore.uploadCV(cvFile.value);
      if (response !== true) {
        throw new Error("Error uploading CV, response was not true");
      }
      console.log("CV uploaded successfully");
    } catch (error) {
      console.error("Error uploading CV", error);
      alert("Error uploading CV - you can upload it later.");
    }
  }

  emit("success");
};

onMounted(() => {
  getAllAttributes();
  emit("stepChange", {
    stepData: steps[currentStep.value],
    currentStep: currentStep.value,
    totalSteps: steps.length,
  });
});

// Generated by https://quicktype.io

const cvFile = ref<File | null>(null);
const isLoadingFile = ref(false);

const handleCVUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    cvFile.value = target.files[0];
  }
  isLoadingFile.value = true;
  parseCv(cvFile.value as File)
    .then((response) => {
      if (!response || response.is_cv === undefined) {
        console.error("Error parsing CV");
        alert("Error parsing CV. Upload a valid PDF file, or continue anyway.");
        return;
      }

      if (response.is_cv === false) {
        console.error("CV is not valid");
        alert(
          "The CV you uploaded is does not look like a CV. Please upload a valid CV to continue, or risk your CV being rejected later."
        );
        return;
      }

      formData.name = response.name;
      formData.surname = response.surname;
      formData.city = response.current_city;
      formData.email = response.email;
      formData.phone = response.phone_e164;

      // Match the languages with the languages array. Note the response may contain languages like "English (intermediate)" or "English (native)".
      const matchedLanguages = response.languages?.map((language) => {
        const match = languages.value?.find((l) =>
          language.toLowerCase().includes(l.toLowerCase())
        );
        return match ? match : language;
      });

      formData.languages =
        matchedLanguages?.filter((language) =>
          languages.value?.includes(language)
        ) ?? [];

      // Advance to the next step
      currentStep.value++;
      emit("stepChange", {
        stepData: steps[currentStep.value],
        currentStep: currentStep.value,
        totalSteps: steps.length,
      });
    })
    .catch((error) => {
      console.error("Error parsing CV", error);
    })
    .finally(() => {
      isLoadingFile.value = false;
    });
};

const parseCv = async (file: File): Promise<ParsedCV | null> => {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const response = await postParseCv(formData);
    console.log("CV parsed successfully", response);
    return response.parsed;
  } catch (error) {
    console.error("Error parsing CV", error);
    throw error;
  }
};
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
    <fieldset :class="{ hidden: currentStep !== 0 }" :aria-busy="isLoadingFile">
      <label for="cv-upload" class="sr-only">
        {{ $t("Upload your CV") }}
      </label>
      <input
        type="file"
        id="cv-upload"
        name="cv-upload"
        accept=".pdf"
        @change="handleCVUpload"
        class="mb-4"
        :disabled="isLoadingFile"
        :aria-busy="isLoadingFile"
        required
      />
    </fieldset>
    <!-- Step 1: First Name and Surname -->
    <fieldset :class="{ hidden: currentStep !== 1 }">
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
    <fieldset :class="{ hidden: currentStep !== 2 }">
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
    <fieldset :class="{ hidden: currentStep !== 3 }">
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
    <fieldset :class="{ hidden: currentStep !== 4 }">
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

    <!-- Step 5: Certifications -->
    <fieldset :class="{ hidden: currentStep !== 5 }">
      <label for="certifications" class="sr-only">Certifications</label>
      <div class="flex flex-wrap gap-2 flex-col">
        <label v-for="certification in certifications" :key="certification">
          <input
            type="checkbox"
            :value="certification"
            v-model="formData.certifications"
            class="mr-2"
          />
          {{ certification }}
        </label>
      </div>
      <div v-if="formErrors.certifications">
        Please select at least one certification.
      </div>
    </fieldset>

    <!-- Step 6: Skills -->
    <fieldset :class="{ hidden: currentStep !== 6 }">
      <label for="skills" class="sr-only">Skills</label>
      <div class="flex flex-wrap gap-2 flex-col">
        <label v-for="skill in skills" :key="skill">
          <input
            type="checkbox"
            :value="skill"
            v-model="formData.skills"
            class="mr-2"
          />
          {{ skill }}
        </label>
      </div>
      <div v-if="formErrors.skills">Please select at least one skill.</div>
    </fieldset>

    <!-- Step 7: Experience -->
    <fieldset :class="{ hidden: currentStep !== 7 }">
      <label for="experiences" class="sr-only">Experience</label>
      <div class="flex flex-wrap gap-2 flex-col">
        <label v-for="experience in experiences" :key="experience">
          <input
            type="checkbox"
            :value="experience"
            v-model="formData.experiences"
            class="mr-2"
          />
          {{ experience }}
        </label>
      </div>
      <div v-if="formErrors.experiences">
        Please select at least one experience.
      </div>
    </fieldset>

    <!-- Step 7: Experience -->
    <fieldset :class="{ hidden: currentStep !== 8 }">
      <label for="external_review_url">URL to review</label>
      <input
        type="url"
        placeholder="URL to review"
        name="external_review_url"
        v-model="formData.external_review_url"
        pattern="https?://.+"
        required
      />
      <div v-if="formErrors.external_review_url">
        Please provide a URL to a review you got on the web.
      </div>
      <small v-else>
        Provide a link to a Google, Viator, TripAdvisor, or similar review about
        you as a guide. Make sure your name is clearly stated by the person who
        wrote the review.
      </small>
    </fieldset>

    <!-- Step 7: Contact Info -->
    <fieldset :class="{ hidden: currentStep !== 9 }">
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

    <base-button type="submit" :id="'next'" :disabled="isLoadingFile">{{
      isLastStep ? $t("Sign up") : $t("Next")
    }}</base-button>
    <a href="/login" class="mt-1 underline">Already have an account?</a>
  </form>
</template>

<style scoped>
form {
  display: grid;
  grid-template-rows: 1fr auto;
  min-height: 79svh;
}
</style>
