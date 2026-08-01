create campaigncontainer
with heading campaign flow
 : selectors{date, select campaign}
for the dates -> user can select 7d -> days of the week
              -> specific month -> numbers of that month ->provide  dropdown to select the month : default this month
              -> year -> months of the year
              -> years -> years , -> provide drop down

1. add campaign flow - rename it grwoth, remove it from the the officeoverview.tsx
lete every thing inside this container leave only the graphs
2. add audience mix - leave only one heading audience mix delete traffic sources, remove it from the the officeoverview.tsx
    adience mix : shall show platform views, like tiktok, instagram, snapchat , facebook & youtube ...
    make the piechat have 2 progresses, likes and views 



2. create a campaign line graph, to show the users progress in the campaign. it should get data from the manage page in the campaign,
 data required likes, & views

 design x -> days of the week, months of the year or years themselves
        y -> numbers in k or m depending on the data available..
             for less than 999.999.k shall remain in k but greater than that shall be in m. even that less than a thousand should be converted to k

the x value key scale should increase as the views or likes increases.
keep the chart size constant
two curves to mark, likes -{gold}
                    views -{green}
lines that mark x & y axes, white 

for the competitions, {container}
organise it in a tabular format like this.
rank    name      likes       views    rate   owe
 X       Y          Z           R       P      T

 where X is rank
 Y -> username 
 Z -> likes in that campaign
 R -> views in that campaign
 P -> line sparkline compared with 7days of the week, views, if its increasing should be green, no increase gold   on decline red
 T -> amount the campaign manager should pay

 on update changes in ranks, the flip down effect 2s for the top, the rest 1s increase.

 this should occupy 70% of the width,
  to the right of it, add block buttons select campaign, date 5d, 10d, 16d, 1m, this year & this month

  i see you tampered with the transactions container, its heigh must be equal to thats of the payment methods container, plz restore the height of the transactions container

  convert all values to k, unless its ≥1m should be converted to m,
  also border the contaer to leave no spaces