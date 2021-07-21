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
    <button on:click={yeas}>Download</button>
    <ProgressBar progress={progress} />
</main>

<style>
    main {
        text-align: center;
        padding: 1em;
        max-width: 240px;
        margin: 0 auto;
        background-color: #141414;
    }

    h1 {
        color: #ff3e00;
        text-transform: uppercase;
        font-size: 4em;
        font-weight: 100;
    }

    @media (min-width: 640px) {
        main {
            max-width: none;
        }
    }
</style>
