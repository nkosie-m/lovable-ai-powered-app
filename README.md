# Workplace AI Companion

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AI Workplace Productivity Assistant</title>
  <style>
    :root{
      --bg:#f6f7fb; --surface:#fff; --surface-2:#f9fafc; --border:#e6e8ef;
      --text:#171a23; --muted:#6f7685; --primary:#5b5ce2; --primary-dark:#4849c9;
      --success:#17865b; --warning:#a56800; --shadow:0 12px 35px rgba(26,31,56,.07);
      --radius:16px;
    }
    *{box-sizing:border-box}
    body{margin:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:var(--bg);color:var(--text)}
    button,input,textarea,select{font:inherit}
    button{cursor:pointer}
    .app{display:flex;min-height:100vh}
    .sidebar{width:250px;background:#10121a;color:#fff;padding:22px 16px;display:flex;flex-direction:column;position:fixed;inset:0 auto 0 0;z-index:20}
    .brand{display:flex;align-items:center;gap:11px;padding:4px 10px 28px;font-weight:750;letter-spacing:-.02em}
    .brand-mark{width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,#7a7bf0,#4f50d2);display:grid;place-items:center;font-weight:800}
    .nav{display:grid;gap:5px}
    .nav button{border:0;background:transparent;color:#aeb3c2;text-align:left;padding:11px 12px;border-radius:10px;display:flex;align-items:center;gap:11px}
    .nav button:hover,.nav button.active{background:#1d202b;color:#fff}
    .nav-icon{width:19px;text-align:center;opacity:.9}
    .sidebar-bottom{margin-top:auto;border-top:1px solid #272a35;padding-top:16px}
    .user{display:flex;gap:10px;align-items:center;padding:9px}
    .avatar{width:34px;height:34px;border-radius:50%;background:#dddffb;color:#4748bc;display:grid;place-items:center;font-size:12px;font-weight:800}
    .user small{display:block;color:#858b9b;margin-top:2px}
    .main{margin-left:250px;width:calc(100% - 250px);min-width:0}
    .topbar{height:72px;background:rgba(255,255,255,.9);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 34px;position:sticky;top:0;z-index:10}
    .mobile-menu{display:none;border:0;background:transparent;font-size:22px}
    .topbar h1{font-size:18px;margin:0;letter-spacing:-.02em}
    .top-actions{display:flex;gap:9px}
    .icon-btn{width:38px;height:38px;border:1px solid var(--border);background:#fff;border-radius:10px}
    .content{max-width:1300px;margin:0 auto;padding:34px}
    .hero{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:28px}
    .eyebrow{color:var(--primary);font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.08em}
    .hero h2{font-size:32px;line-height:1.15;margin:7px 0 8px;letter-spacing:-.04em}
    .hero p{color:var(--muted);margin:0;max-width:650px}
    .status{background:#fff;border:1px solid var(--border);border-radius:12px;padding:10px 13px;font-size:12px;color:var(--muted);white-space:nowrap}
    .status span{display:inline-block;width:7px;height:7px;border-radius:50%;background:#25a86f;margin-right:7px}
    .tools{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px}
    .tool-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px;box-shadow:0 5px 18px rgba(26,31,56,.035);transition:.2s}
    .tool-card:hover{transform:translateY(-2px);box-shadow:var(--shadow)}
    .tool-card.selected{border-color:#a7a7f3;box-shadow:0 0 0 3px rgba(91,92,226,.08)}
    .tool-top{display:flex;justify-content:space-between;align-items:flex-start}
    .tool-icon{width:42px;height:42px;border-radius:12px;background:#efefff;color:var(--primary);display:grid;place-items:center;font-size:19px}
    .tool-card h3{font-size:16px;margin:16px 0 6px}
    .tool-card p{font-size:13px;line-height:1.5;color:var(--muted);margin:0 0 15px}
    .tool-link{border:0;background:transparent;color:var(--primary);font-weight:700;padding:0}
    .workspace{display:grid;grid-template-columns:minmax(0,1.08fr) minmax(0,.92fr);gap:18px}
    .panel{background:#fff;border:1px solid var(--border);border-radius:var(--radius);box-shadow:0 5px 18px rgba(26,31,56,.035);overflow:hidden}
    .panel-head{padding:19px 21px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
    .panel-head h3{margin:0;font-size:15px}
    .panel-head span{font-size:12px;color:var(--muted)}
    .panel-body{padding:20px}
    label{display:block;font-size:12px;font-weight:750;margin:0 0 7px}
    textarea,input,select{width:100%;border:1px solid var(--border);background:var(--surface-2);border-radius:11px;padding:12px 13px;color:var(--text);outline:none;transition:.15s}
    textarea:focus,input:focus,select:focus{border-color:#9a9bef;box-shadow:0 0 0 3px rgba(91,92,226,.08);background:#fff}
    textarea{resize:vertical;min-height:112px;line-height:1.5}.output-text{white-space:pre-wrap;line-height:1.65;font-size:13px;color:#303442;min-height:285px;padding:3px}
    .field{margin-bottom:15px}
    .row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .prompt-box{background:#f4f4ff;border:1px solid #e2e2fc;border-radius:12px;padding:12px 13px;margin-top:5px}
    .prompt-box .prompt-label{font-size:10px;font-weight:800;color:var(--primary);text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px}
    .prompt-box p{font-size:12px;line-height:1.5;color:#4d5165;margin:0}
    .actions{display:flex;justify-content:flex-end;gap:9px;margin-top:16px}
    .btn{border:1px solid var(--border);background:#fff;border-radius:10px;padding:10px 14px;font-weight:700;font-size:13px}
    .btn.primary{background:var(--primary);border-color:var(--primary);color:#fff}
    .btn.primary:hover{background:var(--primary-dark)}
    .btn:disabled{opacity:.55;cursor:not-allowed}
    .btn.secondary{background:#f5f5ff;border-color:#dedffd;color:#4849c9}
    .btn.danger{color:#a42b2b}
    .output-actions{display:flex;gap:7px;flex-wrap:wrap}
    .char-count{font-size:10px;color:var(--muted);text-align:right;margin-top:5px}
    .feature-badges{display:flex;gap:6px;flex-wrap:wrap;margin-top:12px}
    .badge{font-size:10px;font-weight:750;padding:5px 8px;border-radius:999px;background:#f0f0ff;color:#4b4cc5}
    .loading{display:flex;align-items:center;gap:9px;color:var(--muted);font-size:13px}
    .spinner{width:15px;height:15px;border:2px solid #dfe0f8;border-top-color:var(--primary);border-radius:50%;animation:spin .7s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}
    .output{min-height:315px;background:#fcfcfe;border:1px solid var(--border);border-radius:12px;padding:14px}
    .output textarea{height:100%;min-height:285px;border:0;background:transparent;padding:3px;resize:vertical;box-shadow:none}
    .output-meta{display:flex;justify-content:space-between;margin-top:9px;font-size:11px;color:var(--muted)}
    .disclaimer{margin-top:20px;padding:14px 16px;border:1px solid #eadfbd;background:#fffaf0;border-radius:12px;color:#66532d;font-size:12px;line-height:1.55}
    .disclaimer strong{color:#4e3d1c}
    .hidden{display:none}
    .toast{position:fixed;right:24px;bottom:24px;background:#171a23;color:#fff;padding:11px 15px;border-radius:10px;font-size:13px;opacity:0;transform:translateY(8px);pointer-events:none;transition:.2s;z-index:50}
    .toast.show{opacity:1;transform:translateY(0)}
    .signin-btn{width:100%;border:1px solid #343845;background:#1d202b;color:#fff;border-radius:10px;padding:11px 12px;font-weight:750;text-align:left;margin-bottom:10px}.signin-btn:hover{background:#272b38}.auth-overlay{position:fixed;inset:0;background:rgba(9,11,17,.62);backdrop-filter:blur(5px);display:none;align-items:center;justify-content:center;padding:20px;z-index:100}.auth-overlay.open{display:flex}.auth-card{width:min(420px,100%);background:#fff;border:1px solid var(--border);border-radius:18px;box-shadow:0 25px 70px rgba(0,0,0,.22);padding:25px}.auth-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:22px}.auth-header h2{margin:0 0 5px;font-size:21px}.auth-header p{margin:0;color:var(--muted);font-size:12px}.close-auth{border:0;background:#f1f2f6;width:32px;height:32px;border-radius:9px;font-size:18px}.auth-submit{width:100%;margin-top:4px}.auth-note{font-size:11px;color:var(--muted);line-height:1.5;margin:14px 0 0;text-align:center}.auth-error{display:none;background:#fff1f1;color:#a42b2b;border:1px solid #f0cccc;border-radius:9px;padding:9px 11px;font-size:12px;margin-bottom:12px}.auth-error.show{display:block}
    @media(max-width:1000px){.tools{grid-template-columns:1fr}.workspace{grid-template-columns:1fr}}
    @media(max-width:720px){
      .sidebar{transform:translateX(-100%);transition:.2s}.sidebar.open{transform:translateX(0)}
      .main{margin-left:0;width:100%}.mobile-menu{display:block}
      .topbar{padding:0 18px}.content{padding:22px 16px}.hero{align-items:flex-start;flex-direction:column}
      .hero h2{font-size:27px}.status{white-space:normal}
      .row{grid-template-columns:1fr}
    }
  





    

AI

Workplace AI


    
      ✉ Email Generator
      ▤ Meeting Notes
      ⌕ Research Assistant
      ◷ History
    
    


      ↪   Sign in to workspace

U

UserWorkspace account


    



  
    


      

☰

Email Generator


      

?⚙


    



    


      


        


          

AI productivity workspace


          

Get workplace tasks done faster.


          

Create polished emails, turn meeting transcripts into concise notes, and structure research into useful briefs — with editable AI-assisted outputs.


        


        

AI assistant ready


      



      


        


          

✉

01


          

Smart Email Generator

Generate polished professional emails with formal, friendly, or persuasive tones.

FormalFriendlyPersuasive

Open tool →
        


        


          

▤

02


          

Meeting Notes Summarizer

Summarize long notes and extract action items, decisions, owners, and deadlines.

DecisionsActionsDeadlines

Open tool →
        


        


          

⌕

03


          

AI Research Assistant

Summarize topics and articles, surface insights, and provide practical recommendations.

InsightsRecommendations

Open tool →
        


      



      


        


          

Describe the email you need

Structured prompt


          


            


              


                

Recipient / audience


                

ToneProfessionalFriendlyConcisePersuasive


              


              

What should the email accomplish?


              

Important context


              

AI prompt

Write a professional workplace email for the stated audience and goal. Be clear, concise, and action-oriented. Do not invent facts.


            



            


              

Meeting title


              

Meeting transcript / notes


              

AI prompt

Summarize only information present in the source. Separate decisions, action items, owners, deadlines, open questions, and notable discussion points.


            



            


              

Research question or topic


              

Article / source content (optional)


              


                

Audience


                

Desired depthExecutive briefDetailed analysisResearch outline


              


              

AI prompt

Frame the question, identify sub-questions, distinguish known facts from assumptions, and propose sources or validation steps. Avoid fabricated citations.


            



            


              

Your recent generated outputs will appear here during a live session.


              


            



            


              Clear
              Generate draft
            


          


        



        


          

AI output

Read-only


          


            

Your AI-assisted result will appear here.


            

No output yet

CopyExport .txtSave


            

Responsible AI: Review AI-generated content before sharing or acting on it. Outputs may be incomplete or incorrect. Do not enter confidential, regulated, or sensitive personal information unless your organization's approved AI policy allows it.


          


        


      


    

AI settings

Configure the app for an AI provider or local demo mode.

×

Generation modeDemo / browser modeAPI integration ready

API endpoint

For production, keep API keys on a secure server. The browser should call your backend rather than exposing provider secrets.

Save settings

Sign in

Access your AI productivity workspace

×

Please enter both your username and password.

Username

Password

Sign in

Demo authentication only. Connect this form to a secure authentication provider for production.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://nkosi-ai-app.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6a0bc7fb-13d4-43f8-94b8-2684fcbdadf7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
