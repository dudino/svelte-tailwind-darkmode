<h1>Test Message</h1>
<p>Simple text for extraction</p>
<div>Another test string</div>
<img alt="Profile Picture" src="/test.jpg" />
<button title="Click Here">Button Text</button>

<script>
const message = $derived('This Should Be Extracted')
const greeting = $derived('Welcome Message')
</script>
