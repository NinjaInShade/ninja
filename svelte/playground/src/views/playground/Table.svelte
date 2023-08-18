<script lang="ts">
    import NW from '~/index';

    // TODO: use real dates (been lazy and haven't yet as would need formatting)

    const columns = [
        { key: 'title', label: 'Title', width: '100px' },
        { key: 'name', label: 'Name', width: '180px' },
        { key: 'age', label: 'Age', title: 'The age!', width: '70px' },
        { key: 'dob', label: 'DOB', title: (row) => `The DOB is ${row.dob}`, width: '140px' },
        { key: 'email', label: 'Email' },
        { key: 'view', label: 'View', component: [NW.Button, { text: 'View!' }], width: '95px', align: 'center' },
    ];
    // const columns = [
    //     { key: 'title', label: 'Title' },
    //     { key: 'name', label: 'Name' },
    //     { key: 'age', label: 'Age', title: 'The age!' },
    //     { key: 'dob', label: 'DOB', title: (row) => `The DOB is ${row.dob}` },
    //     { key: 'email', label: 'Email' },
    // ];
    const data = [
        { id: 1, title: 'Mrs', name: 'Leanne Graham', age: 99, dob: '22/12/2015', email: 'Sincere@april.biz' },
        { id: 2, title: 'Mr', name: 'Ervin Howell', age: 29, dob: '19/07/2020', email: 'Shanna@melissa.tv' },
        { id: 3, title: 'Mrs', name: 'Clementine Bauch', age: 59, dob: '02/10/2007', email: 'Nathan@yesenia.net' },
        { id: 4, title: 'Mr', name: 'Peter Rich', age: undefined, dob: null, email: 'Peter.Rich@hotmail.com' },
        { id: 5, title: 'Mrs', name: 'Patricia Lebsack', age: 129, dob: '08/03/2012', email: 'Julianne.OConner@kory.org' },
        { id: 6, title: 'Mrs', name: 'Patricia Lebsack', age: 129, dob: '08/03/2012', email: 'Julianne.OConner@kory.org' },
        { id: 7, title: 'Mrs', name: 'Patricia Lebsack', age: 129, dob: '08/03/2012', email: 'Julianne.OConner@kory.org' },
        { id: 8, title: 'Mrs', name: 'Patricia Lebsack', age: 129, dob: '08/03/2012', email: 'Julianne.OConner@kory.org' },
        { id: 9, title: 'Mrs', name: 'Patricia Lebsack', age: 129, dob: '08/03/2012', email: 'Julianne.OConner@kory.org' },
        { id: 10, title: 'Mrs', name: 'Patricia Lebsack', age: 129, dob: '08/03/2012', email: 'Julianne.OConner@kory.org' },
        { id: 11, title: 'Mrs', name: 'Patricia Lebsack', age: 129, dob: '08/03/2012', email: 'Julianne.OConner@kory.org' },
        { id: 12, title: 'Mrs', name: 'Patricia Lebsack', age: 129, dob: '08/03/2012', email: 'Julianne.OConner@kory.org' },
        { id: 13, title: 'Mrs', name: 'Patricia Lebsack', age: 129, dob: '08/03/2012', email: 'Julianne.OConner@kory.org' },
        { id: 14, title: 'Mrs', name: 'Patricia Lebsack', age: 129, dob: '08/03/2012', email: 'Julianne.OConner@kory.org' },
        { id: 15, title: 'Mrs', name: 'Patricia Lebsack', age: 129, dob: '08/03/2012', email: 'Julianne.OConner@kory.org' },
    ];
    let selectedKeys: number[] = [];
</script>

<div class="flex" style="height: 400px">
    <NW.Table {columns} data={[]} bind:selectedKeys selectable />
</div>

<div class="flex" style="height: 400px">
    <NW.Table {columns} data={data.slice(0, 2)} bind:selectedKeys />
</div>

<div class="flex" style="height: 600px">
    <NW.Table {columns} {data} bind:selectedKeys selectable />
</div>

<style>
    .flex {
        display: flex;
        flex-flow: column nowrap;
    }

    .flex:not(:last-child) {
        margin-bottom: 2em;
    }
</style>
