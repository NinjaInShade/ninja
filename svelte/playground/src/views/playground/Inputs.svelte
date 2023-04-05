<script lang="ts">
    import NW from '~/index';
    import TestModal from './TestModal.svelte';

    let username: string | null = null;
    let email: string | null = null;

    let isInTech = false;

    const checkboxChange = async (value: boolean) => {
        console.log('Checked:', value);
    };

    const testInputChange = (value) => {
        console.log('Changed:', value);
    };
</script>

<div class="flex">
    <NW.Button
        onClick={async () => {
            console.log('Before open!');
            const valueReturned = await NW.nav.openModal(TestModal, {}, { asPromise: true });
            console.log('After open! Returned with', valueReturned);
        }}>Open modal</NW.Button
    >

    <!-- Input -->
    <div class="column">
        <div class="row">
            <NW.Fieldset label="Username" htmlName="Username">
                <NW.Input bind:value={username} />
            </NW.Fieldset>
            <p class="lead">Default</p>
        </div>

        <div class="row">
            <NW.Fieldset label="Username" htmlName="Username">
                <NW.Input bind:value={username} placeholder="Enter your username" icon="magnifying-glass" />
            </NW.Fieldset>
            <p class="lead">Icon</p>
        </div>

        <div class="row">
            <NW.Fieldset label="Username" htmlName="Username">
                <NW.Input bind:value={username} placeholder="Enter your username" icon="magnifying-glass" disabled />
            </NW.Fieldset>
            <p class="lead">Disabled</p>
        </div>

        <div class="row">
            <NW.Fieldset label="Email" htmlName="Email">
                <NW.Input bind:value={email} placeholder="Enter your email" icon="magnifying-glass" loading />
            </NW.Fieldset>
            <p class="lead">Loading</p>
        </div>

        <div class="row">
            <NW.Fieldset label="Email" htmlName="Email">
                <NW.Input bind:value={email} error="Enter a valid email!" placeholder="Enter your email" icon="magnifying-glass" onChange={testInputChange} />
            </NW.Fieldset>
            <p class="lead">Error</p>
        </div>
    </div>

    <!-- TextArea -->
    <div class="column tx-column">
        <div class="row">
            <NW.Fieldset label="Username" htmlName="Username">
                <NW.TextArea bind:value={username} />
            </NW.Fieldset>
            <p class="lead">Default</p>
        </div>

        <div class="row">
            <NW.Fieldset label="Username" htmlName="Username">
                <NW.TextArea bind:value={username} placeholder="Enter your username" />
            </NW.Fieldset>
            <p class="lead">Icon</p>
        </div>

        <div class="row">
            <NW.Fieldset label="Username" htmlName="Username">
                <NW.TextArea bind:value={username} placeholder="Enter your username" disabled />
            </NW.Fieldset>
            <p class="lead">Disabled</p>
        </div>

        <div class="row">
            <NW.Fieldset label="Email" htmlName="Email">
                <NW.TextArea bind:value={email} placeholder="Enter your email" loading />
            </NW.Fieldset>
            <p class="lead">Loading</p>
        </div>

        <div class="row">
            <NW.Fieldset label="Email" htmlName="Email">
                <NW.TextArea bind:value={email} onChange={testInputChange} error="Not a valid email!" placeholder="Enter your email" />
            </NW.Fieldset>
            <p class="lead">Error</p>
        </div>
    </div>

    <div class="column">
        <div class="row">
            <NW.Fieldset label="Username" htmlName="Username">
                <NW.TextArea bind:value={username} autoResize />
            </NW.Fieldset>
            <p class="lead">Auto resize</p>
        </div>
    </div>

    <!-- Datepicker -->
    <!-- <div class="column">
    <div class="row">
      <NW.TextArea />
    </div>
  </div> -->

    <!-- Checkbox -->
    <div class="column">
        <div class="row">
            <NW.Fieldset label="Is in tech?" htmlName="isInTech" labelDir="row-reverse">
                <NW.Checkbox bind:value={isInTech} onChange={checkboxChange} />
            </NW.Fieldset>
            <p class="lead">Default</p>
        </div>

        <div class="row">
            <NW.Fieldset label="Is in tech?" htmlName="isInTech" labelDir="row-reverse">
                <NW.Checkbox bind:value={isInTech} disabled />
            </NW.Fieldset>
            <p class="lead">Disabled</p>
        </div>

        <div class="row">
            <NW.Fieldset label="Is in tech?" htmlName="isInTech" labelDir="row-reverse">
                <NW.Checkbox bind:value={isInTech} loading />
            </NW.Fieldset>
            <p class="lead">Loading</p>
        </div>

        <div class="row">
            <NW.Fieldset label="Is in tech?" htmlName="isInTech" labelDir="row-reverse">
                <NW.Checkbox bind:value={isInTech} error="Check it!" />
            </NW.Fieldset>
            <p class="lead">Error</p>
        </div>
    </div>

    <!-- Radio button -->
    <!-- <div class="column">
    <div class="row">
      <NW.TextArea />
    </div>
  </div> -->

    <!-- Select -->
    <!-- <div class="column">
    <div class="row">
      <NW.TextArea />
    </div>
  </div> -->
</div>

<style>
    .flex {
        display: flex;
        flex-direction: column;
        justify-content: stretch;
        align-items: flex-start;
        gap: 1.5em;
    }

    .column {
        display: flex;
        align-items: stretch;
        justify-content: flex-start;
        gap: 1.5em;
        flex: 1 0 0;
    }

    .tx-column {
        min-height: 175px;
    }

    .column:not(:first-child) {
        margin-top: 25px;
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
