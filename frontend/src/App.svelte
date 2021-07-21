<script>
    import axios from 'axios';
    import ProgressBar from './ProgressBar.svelte';

    const focus = node => node.focus();
    let url = '';
    let eventSource = null;
    let progress = 0;

    function yeas() {
        if (eventSource != null) {
            return;
        }

        eventSource = new EventSource(
            `http://localhost:3001/api/convert?url=${encodeURIComponent(url)}&format=mp3`
        );

        eventSource.addEventListener('message', (e) => {
            console.log(`Got a message: ${e.data}`);
            progress = 0;
        });

        eventSource.addEventListener('progress', (e) => {
            console.log(`Got progress: ${e.data}`);
            progress = Math.floor(JSON.parse(e.data).progress * 100);
        });

        eventSource.addEventListener('done', (e) => {
            progress = 100;
            eventSource.close();
            eventSource = null;
        });

        eventSource.addEventListener('error', (e) => {
            console.log(e);
            eventSource.close();
            eventSource = null;
        });
    }
</script>

<main>
    <h1>Youtube Downloader</h1>
    <input
        bind:value={url}
        use:focus
        type="text"
        placeholder="Enter the url of the video you want to download"
    >
    <button on:click={yeas}>Convert</button>
    <ProgressBar progress={progress} />
</main>

<style lang="scss">
    @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700;800;900&display=swap');

    $primary: #eeeeee;
    $secondary: #1a2326;

    main {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 1em;
        max-width: 240px;
        margin: 0 auto;
        font-family: 'Rubik', sans-serif;
    }

    h1 {
        font-size: 34pt;
        color: $secondary;
        margin: 6rem;
    }

    input {
        padding: 18px;
        outline: none;
        border: none;
        border-radius: 50px;
        font-size: 16pt;
        width: 800px;
        margin: 3rem;
    }

    button {
        background-color: $secondary;
        color: $primary;
        border-radius: 18px;
        font-weight: 600;
        padding: 16px;
        font-size: 16pt;
    }

    @media (min-width: 640px) {
        main {
            max-width: none;
        }
    }
</style>
