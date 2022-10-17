<script lang="js">
    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('search').addEventListener('submit', (e) => {
            e.preventDefault();
            const search = document.getElementById('inputChannel').value;
            window.location.href = `/c/${search}`;
        });
    });
</script>

<svelte:head>
    <title>Search / Emote Tracker</title>
</svelte:head>

<div class="wrap">
    <form class="search" id="search">
        <input type="text" class="searchTerm" id="inputChannel" placeholder="Which channel are you looking for? 🔍" />
        <button id="search" type="submit" class="searchButton">
            <i class="fa fa-search" />
        </button>
    </form>
</div>

<style>
    .search {
        width: 100%;
        position: relative;
        display: flex;
    }

    .searchTerm {
        width: 100%;
        border: 3px solid #042429a2;
        border-right: none;
        padding: 5px;
        height: 20px;
        border-radius: 5px 0 0 5px;
        outline: none;
        color: #9dbfaf;
        font-family: 'Quicksand';
        font-size: 25px;
    }

    .searchTerm:focus {
        color: #000000e3;
        font-size: 25px;
    }

    .searchButton {
        width: 40px;
        height: 36px;
        border: 1px solid #1b9eaf7e;
        background: #00b4cc91;
        text-align: center;
        color: rgb(151, 148, 148);
        border-radius: 0 5px 5px 0;
        cursor: pointer;
        font-size: 20px;
    }

    /*Resize the wrap to see the search bar change!*/
    .wrap {
        width: 30%;
        position: absolute;
        top: 20%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
</style>
