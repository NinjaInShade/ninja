<script lang="ts">
    import NW from '~/index';

    let disabled = false;
    let loading = false;

    // const setDisabled = () => {
    //   disabled = !disabled;
    // };
    // const setLoading = () => {
    //   loading = !loading;
    // };
</script>

<div class="flex">
    <div class="column">
        <div class="row">
            <NW.Spinner />
            <p class="lead">Spinner default</p>
        </div>
        <div class="row">
            <NW.Spinner --size="32px" />
            <p class="lead">Custom size</p>
        </div>
        <div class="row">
            <NW.Spinner --color="var(--primary-300)" />
            <p class="lead">Custom color</p>
        </div>
        <div class="row">
            <NW.Spinner --size="32px" --color="var(--primary-300)" />
            <p class="lead">Both</p>
        </div>
    </div>

    <div class="column">
        <div class="row">
            <NW.Icon name="wand-magic-sparkles" />
            <p class="lead">Icon default</p>
        </div>
        <div class="row">
            <NW.Icon name="wand-magic-sparkles" --size="32px" />
            <p class="lead">Custom size</p>
        </div>
        <div class="row">
            <NW.Icon name="wand-magic-sparkles" --color="var(--primary-300)" />
            <p class="lead">Custom color</p>
        </div>
        <div class="row">
            <NW.Icon name="wand-magic-sparkles" --size="32px" --color="var(--primary-300)" />
            <p class="lead">Both</p>
        </div>
    </div>
</div>

<!-- <div class="flex" style="margin-top: 54px;">
  <div style="display: flex; justify-content: flex-start; gap: 0.5em;">
    <NW.Button>Height</NW.Button>
    <NW.Fieldset label="Test">
      <NW.Input value="Height" />
    </NW.Fieldset>
  </div>
</div> -->

<!-- <div style="margin-top: 4em;">
    <p>Below buttons set all inputs to the desired effect</p>
    <div class="flex" style="margin-top: 0.5em; gap: 0.5em;">
      <NW.Button theme="white" textColor="var(--black)" onClick={setDisabled}>Set disabled</NW.Button>
      <NW.Button theme="white" textColor="var(--black)" onClick={setLoading}>Set loading</NW.Button>
    </div>
  </div> -->
<style>
    .flex {
        display: flex;
        justify-content: stretch;
        align-items: flex-start;
        gap: 1.5em;
    }

    .column {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: center;
        gap: 1.5em;
        flex: 1 0 0;
    }

    .row {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5em;
    }

    .lead {
        text-align: center;
    }
</style>
