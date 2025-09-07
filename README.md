int solve(string &s){
int i = 0;
int j = 0;
vector<int> freq(26,0);
int ans = 0;
while(j < n){
if(freq[s[j] - 'a'] >= 1 ){
while(s[i] != s[j]){
i++;
}
}else{
freq[s[j] - 'a']++;
ans = max(ans,j - i + 1);
}
j++;
}

return ans;
}
