export async function onRequestPost(context: any) {
  try {
    const body = await context.request.json();
    const { email, consent } = body;

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ success: false, error: 'A valid email address is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!consent) {
      return new Response(JSON.stringify({ success: false, error: 'Consent to privacy policy is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Subscription confirmed. You will receive real-time mountain pass road condition alerts.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid request payload.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
