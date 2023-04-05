<script lang="ts">
    import NW from '~/index';

    let disabled = false;
    let loading = false;

    const setDisabled = () => {
        disabled = !disabled;
    };

    const setLoading = () => {
        loading = !loading;
    };

    const testAsyncButtonClick = async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(null);
            }, 2000);
        });
    };
</script>

<div class="flex">
    <div class="column">
        <div class="row">
            <NW.Button {disabled} {loading} style="width: 100%;" onClick={testAsyncButtonClick}>Click me!</NW.Button>
            <p class="lead">Normal</p>
        </div>
        <div class="row">
            <NW.Button {disabled} {loading} icon="wand-magic-sparkles" style="width: 100%;">Click me!</NW.Button>
            <p class="lead">Icon</p>
        </div>
        <div class="row">
            <NW.Button disabled={disabled || true} {loading} style="width: 100%;">Click me!</NW.Button>
            <p class="lead">Disabled</p>
        </div>
        <div class="row">
            <NW.Button {disabled} loading={loading || true} style="width: 100%;">Click me!</NW.Button>
            <p class="lead">Loading</p>
        </div>
    </div>

    <div class="column">
        <div class="row">
            <NW.Button {disabled} {loading} ghost style="width: 100%;">Click me!</NW.Button>
            <p class="lead">Ghost</p>
        </div>
        <div class="row">
            <NW.Button {disabled} {loading} icon="wand-magic-sparkles" ghost style="width: 100%;">Click me!</NW.Button>
            <p class="lead">Ghost icon</p>
        </div>
        <div class="row">
            <NW.Button {loading} ghost disabled={disabled || true} style="width: 100%;">Click me!</NW.Button>
            <p class="lead">Ghost disabled</p>
        </div>
        <div class="row">
            <NW.Button {disabled} ghost loading={loading || true} style="width: 100%;">Click me!</NW.Button>
            <p class="lead">Ghost loading</p>
        </div>
    </div>

    <div class="column">
        <div class="row">
            <NW.Button {disabled} {loading} icon="wand-magic-sparkles" textColor="var(--primary-700)" style="width: 100%;">Click me!</NW.Button>
            <p class="lead">Txt clr icon</p>
        </div>
        <div class="row">
            <NW.Button {disabled} {loading} icon="wand-magic-sparkles" iconColor="var(--primary-700)" style="width: 100%;">Click me!</NW.Button>
            <p class="lead">Icon clr icon</p>
        </div>
        <div class="row">
            <NW.Button {disabled} {loading} icon="wand-magic-sparkles" iconColor="var(--primary-700)" textColor="var(--primary-700)" style="width: 100%;">Click me!</NW.Button>
            <p class="lead">Txt/icon clr icon</p>
        </div>
        <div class="row">
            <NW.Button {disabled} {loading} icon="wand-magic-sparkles" iconColor="var(--primary-900)" textColor="var(--primary-900)" ghost style="width: 100%;">Click me!</NW.Button>
            <p class="lead">Above combined ghost (unaffected until hover)</p>
        </div>
    </div>

    <div class="column">
        <div class="row">
            <NW.Button {disabled} {loading} theme="white" icon="brands fa-github" textColor="var(--black)" iconColor="var(--black)" style="width: 100%;">Source code</NW.Button>
            <p class="lead">Github</p>
        </div>
        <div class="row">
            <NW.Button {disabled} {loading} theme="white" icon="brands fa-github" ghost textColor="var(--black)" iconColor="var(--black)" style="width: 100%;">Source code</NW.Button>
            <p class="lead">Github ghost</p>
        </div>
        <div class="row">
            <NW.Button {disabled} {loading} theme="black" icon="brands fa-github" textColor="var(--white)" iconColor="var(--white)" style="width: 100%;">Source code</NW.Button>
            <p class="lead">Github dark</p>
        </div>
        <div class="row">
            <NW.Button {disabled} {loading} theme="black" icon="brands fa-github" ghost textColor="var(--white)" iconColor="var(--white)" style="width: 100%;">Source code</NW.Button>
            <p class="lead">Github dark ghost</p>
        </div>
    </div>
</div>

<div style="margin-top: 4em;">
    <p>Below buttons set all buttons to the desired effect</p>
    <div class="flex" style="margin-top: 0.5em; gap: 0.5em;">
        <NW.Button theme="white" textColor="var(--black)" onClick={setDisabled}>Set disabled</NW.Button>
        <NW.Button theme="white" textColor="var(--black)" onClick={setLoading}>Set loading</NW.Button>
    </div>
</div>

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
