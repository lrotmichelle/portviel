campaign page
  -organise it like this...
      >heading{campaigns}
         - introduction
         - buttons {joined , managr ,+campaign} - no bg but each with its own rounded border, on hover / touch change the bg color to that of the text but text color to white
         - search bar -remove unified border with the filters
         - filters -remove unified border with the search bar
             - status - active  #default selection
                       - future 
                    
             # non should have a default selection
             - category -lifestyle
                        - gaming
                        - entertainment
                        - sports
                        - education
                        - technology
                        - luxury
                        - music
                        - politics
                        - religion
             # non should have a default selection
             - nitch - due
                     - sound
                     - ugc 
                     - logo
                     - clipping
             # newest should have a default selection
             - compitetion - newest
                          - highest budget
                          - highest available budget
                          - highest cpm
                          - most paid out
                          - less influencers
         {small screen 1st row - status , categoty
                       2nd row - nitch , competiton
          big screen show all in one row}- don't put in one unified border each filter should have its own border, also on pop up. touch anywhere but not inside the filter closes the filter pop but saves the previoud choosen filter

         - cards below

wen campaign page is reached {clicked / refreshed}introducing our users to campaign page.
    -> welcome back the user if user has ever checked the campaign page
         -like this{ welcome back, [username]! explore the latest campaigns to monitize your social media account }
         -for a new user, we can say { monitize your social media account by completing a campaigns }

design 
   create 
    below the intro or welcome message add { button}
                              - Joined - green 
                              - manage - gold
                              - + campaign  - green   
     design : rounded boder with no backgroung on hover -compuer/ touch - touch screen - background to the previous text color then change text color to white . 
     

  the form it pops on clcik - {+campaign} popnup a form with aligned exected data by the campaign-card component
    logic{rules} - campaign name should not exceed 16 characters
          - should not have special characters
          - should not not start / end with a space or period
          - should not have icons or emojis
          - should not be empty
          - should not have consecutive periods
          - if any of the above rules is broken, show a red error message below the input field
          - use place holder text instead of default text 

          add fields 
                     - for max & min {max payout per 1k views }
                     - future check box - on check allow user to enter future dates starting from tomorrow

          {publish campaign}button logic & design
                 - should be disabled until all the rules are satisfied
                 - should be centered and green in color but no bg
                 - on touch / hover 
                    - should have a green background with white text
                    - should have a slight shadow effect
                    - should have a smooth transition effect for hover / touch state 
                - onclick {button}, -> save to the database then display it on the website on the campaign page

 - joined -> page shouws campaigns that user has joined 
     add a search bar,
     add filter below it {cpm , max payout , min payout , competiton}
                  on the page
            - show user joined campaigns
            - allow user to leave the campaign if they want to button at the top
            - allow user to rate the campaign button at the top, then leave a comment{optional}
            - this page - users should be able to interact with the admin, provide feedback, ask questions, and get support for the campaign they have joined {chaat}
            - user can share screenshots of their work, and showcase their progress to the campaign admin and other participants. to be approved for payments
            - {transactions}user can see top competitors , payout & submittions of outher users in that campain
            - {insights} tabular data with a curve graph with unified data of each user in relative to other people in the campaign -sync the campaign progress 
            - {engagement} info to show{ nitch likes & views} total , 

 - manage -> page shows campaigns that user has created 
      add a search bar,
     add filter below it {cpm , max payout , min payout , competiton}
                  on the page
          - allow user to edit the campaign details once every 5 days, update max & min payout amounts 
          - decrease less than 20% the agreed payout amount, and change the campaign start date if it has not yet started.
          - increase the payout amount by any percentage, and change the campaign start date to a future date if it has not yet started.
          - add approve button in the campaign card to approve the screenshots shared by the participants, and allow them to submit their work for payment approval
          - money should be released to the participants only after the campaign admin has approved their work and submitted it for payment processing.
          - money should also be aproved by the site admin just by clicking the approve button next to the user who has participate even though has/ not submitted the screen shots
          - campaign admin should be able to see the list of participants who have joined the campaign, their progress, and their submitted as well as those who hvae not submitted work for approval.
          - we shall create tabular data  a curve graph that sync the the progress of the participants and show the admin how well/terrrible the campaign is performing in terms of engagement and completion rates with relative to similar campaigns in the simlar nitches

