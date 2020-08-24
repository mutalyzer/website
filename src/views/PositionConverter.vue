<template>
  <v-container>
    <v-layout>
      <v-flex xs12>
        <h1 class="display-1 mt-10">Position Converter</h1>
        <p>
          Convert reference positions to selector orientated positions and vice
          versa.
        </p>
    <v-sheet elevation="2" class="mt-10">
      <v-row class="pa-10">
        <v-col cols="12" sm="6" lg="3">
          <v-text-field
            :rules="rules"
            ref="referenceId"
            v-model="referenceId"
            :label="'Reference ID'"
            :hint="'NC_000001.10'"
            :clearable="true"
            autofocus
          ></v-text-field>
        </v-col>

        <v-col cols="12" sm="6" lg="3">
          <v-text-field
            :rules="rules"
            ref="selectorId"
            v-model="selectorId"
            :label="'Selector ID'"
            :hint="'NM_000001.10'"
            :clearable="true"
          ></v-text-field>
        </v-col>

        <v-col cols="12" sm="6" lg="3">
          <v-text-field
            :rules="rules"
            ref="position"
            v-model="position"
            :label="'Position'"
            :hint="'100'"
            :clearable="true"
          ></v-text-field>
        </v-col>

        <v-col cols="12" sm="6" lg="3">
          <v-select
            :items="['Reference', 'Selector']"
            label="Relative to"
          ></v-select>
        </v-col>
      </v-row>
                        <v-btn
            ref="nameCheck"
            :disabled="!valid"
            class="mt-5"
            :to="{
              name: 'NameChecker',
              params: { descriptionRouter: description }
            }"
          >
            Normalize
          </v-btn>

    </v-sheet>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    referenceId: "",
    selectorId: "",
    position: "",
    rules: [value => !!value || "Required."]
  })
};
</script>

<style scoped></style>
