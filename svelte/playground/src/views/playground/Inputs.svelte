<script lang="ts">
    import NW from '~/index';
    import TestModal from './TestModal.svelte';

    let username: string | null = null;
    let email: string | null = null;

    let isInTech = false;
    let size: 'S' | 'M' | 'L' = 'M';
    let category: 'new' | 'in-progress' | 'completed';
    const categoryData = [
        { value: 'new', label: 'New' },
        { value: 'in-progress', label: 'In progress' },
        { value: 'completed', label: 'Completed' },
    ];

    const checkboxChange = async (value: boolean) => {
        console.log('Checked:', value);
    };

    const testInputChange = (value) => {
        console.log('Changed:', value);
    };
</script>

<div style="margin-bottom: 4em;">
    <p>Set all widgets to the desired effect</p>
    <div style="display: flex; gap: 8px; margin-top: 0.5em; gap: 0.5em;">
        <NW.Button theme="white" textColor="var(--black)" onClick={() => (size = 'S')}>Set size S</NW.Button>
        <NW.Button theme="white" textColor="var(--black)" onClick={() => (size = 'M')}>Set size M</NW.Button>
        <NW.Button theme="white" textColor="var(--black)" onClick={() => (size = 'L')}>Set size L</NW.Button>
    </div>
</div>

<div class="flex">
    <div style="display: flex; gap: 8px;">
        <NW.Input bind:value={username} {size} />
        <NW.Button
            theme="black"
            textColor="var(--white)"
            onClick={async () => {
                console.log('Before open!');
                const valueReturned = await NW.nav.openModal(TestModal, {}, { asPromise: true });
                console.log('After open! Returned with', valueReturned);
            }}
            {size}>Open modal</NW.Button
        >
    </div>

    <!-- Input -->
    <div class="column">
        <div class="row">
            <NW.Fieldset label="Username" htmlName="Username" {size}>
                <NW.Input bind:value={username} {size} />
            </NW.Fieldset>
            <p class="lead">Default</p>
        </div>

        <div class="row">
            <NW.Fieldset label="Username" htmlName="Username" {size}>
                <NW.Input bind:value={username} placeholder="Enter your username" icon="magnifying-glass" {size} />
            </NW.Fieldset>
            <p class="lead">Icon</p>
        </div>

        <div class="row">
            <NW.Fieldset label="Username" htmlName="Username" {size}>
                <NW.Input bind:value={username} placeholder="Enter your username" icon="magnifying-glass" disabled {size} />
            </NW.Fieldset>
            <p class="lead">Disabled</p>
        </div>

        <div class="row">
            <NW.Fieldset label="Email" htmlName="Email" {size}>
                <NW.Input bind:value={email} placeholder="Enter your email" icon="magnifying-glass" loading {size} />
            </NW.Fieldset>
            <p class="lead">Loading</p>
        </div>

        <div class="row">
            <NW.Fieldset label="Email" htmlName="Email" {size}>
                <NW.Input bind:value={email} error="Enter a valid email!" placeholder="Enter your email" icon="magnifying-glass" onChange={testInputChange} {size} />
            </NW.Fieldset>
            <p class="lead">Error</p>
        </div>
    </div>

    <!-- TextArea -->
    <div class="column tx-column">
        <div class="row">
            <NW.Fieldset label="Username" htmlName="Username" {size}>
                <NW.TextArea bind:value={username} {size} />
            </NW.Fieldset>
            <p class="lead">Default</p>
        </div>

        <div class="row">
            <NW.Fieldset label="Username" htmlName="Username" {size}>
                <NW.TextArea bind:value={username} placeholder="Enter your username" {size} />
            </NW.Fieldset>
            <p class="lead">Placeholder</p>
        </div>

        <div class="row">
            <NW.Fieldset label="Username" htmlName="Username" {size}>
                <NW.TextArea bind:value={username} placeholder="Enter your username" disabled {size} />
            </NW.Fieldset>
            <p class="lead">Disabled</p>
        </div>

        <div class="row">
            <NW.Fieldset label="Email" htmlName="Email" {size}>
                <NW.TextArea bind:value={email} placeholder="Enter your email" loading {size} />
            </NW.Fieldset>
            <p class="lead">Loading</p>
        </div>

        <div class="row">
            <NW.Fieldset label="Email" htmlName="Email" {size}>
                <NW.TextArea bind:value={email} onChange={testInputChange} error="Not a valid email!" placeholder="Enter your email" {size} />
            </NW.Fieldset>
            <p class="lead">Error</p>
        </div>
    </div>

    <div class="column">
        <div class="row">
            <NW.Fieldset label="Username" htmlName="Username" {size}>
                <NW.TextArea bind:value={username} autoResize {size} />
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
            <NW.Fieldset label="Is in tech?" htmlName="isInTech" labelDir="row-reverse" {size}>
                <NW.Checkbox bind:value={isInTech} onChange={checkboxChange} {size} />
            </NW.Fieldset>
            <p class="lead">Default</p>
        </div>

        <div class="row">
            <NW.Fieldset label="Is in tech?" htmlName="isInTech" labelDir="row-reverse" {size}>
                <NW.Checkbox bind:value={isInTech} disabled {size} />
            </NW.Fieldset>
            <p class="lead">Disabled</p>
        </div>

        <div class="row">
            <NW.Fieldset label="Is in tech?" htmlName="isInTech" labelDir="row-reverse" {size}>
                <NW.Checkbox bind:value={isInTech} loading {size} />
            </NW.Fieldset>
            <p class="lead">Loading</p>
        </div>

        <div class="row">
            <NW.Fieldset label="Is in tech?" htmlName="isInTech" labelDir="row-reverse" {size}>
                <NW.Checkbox bind:value={isInTech} error="Check it!" {size} />
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

    <!-- Select TODO: investigate why we need the extra styles on col/row, but not for NW.Input/NW.TextArea... -->
    <div class="column" style="width: 100%">
        <div class="row" style="flex: 1 0 0px">
            <NW.Fieldset label="Category" , htmlName="category" {size}>
                <NW.Select data={categoryData} bind:value={category} {size} allowClear />
            </NW.Fieldset>
            <p class="lead">Default</p>
        </div>

        <div class="row" style="flex: 1 0 0px">
            <NW.Fieldset label="Category" , htmlName="category" {size}>
                <NW.Select data={categoryData} bind:value={category} {size} allowClear placeholder="Select..." />
            </NW.Fieldset>
            <p class="lead">Placeholder</p>
        </div>

        <div class="row" style="flex: 1 0 0px">
            <NW.Fieldset label="Category" , htmlName="category" {size}>
                <NW.Select data={categoryData} bind:value={category} {size} allowClear placeholder="Select..." disabled />
            </NW.Fieldset>
            <p class="lead">Disabled</p>
        </div>

        <div class="row" style="flex: 1 0 0px">
            <NW.Fieldset label="Category" , htmlName="category" {size}>
                <NW.Select data={categoryData} bind:value={category} {size} allowClear placeholder="Select..." loading />
            </NW.Fieldset>
            <p class="lead">Loading</p>
        </div>

        <div class="row" style="flex: 1 0 0px">
            <NW.Fieldset label="Category" , htmlName="category" {size}>
                <NW.Select data={categoryData} bind:value={category} {size} allowClear placeholder="Select..." error="This is an invalid selection" />
            </NW.Fieldset>
            <p class="lead">Error</p>
        </div>

        <div class="row" style="flex: 1 0 0px">
            <NW.Fieldset label="Category" , htmlName="category" {size}>
                <NW.Select data={categoryData} bind:value={category} {size} allowClear placeholder="Select..." multiSelect />
            </NW.Fieldset>
            <p class="lead">Multi-select</p>
        </div>
    </div>

    <!-- REMOVE ME (SELECT MENU OVERFLOWS BODY - BUG) -->
    <div style="width: 1px; height: 1px; margin-bottom: 250px" />
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
        gap: 0.5em;
    }

    .lead {
        text-align: center;
    }
</style>
