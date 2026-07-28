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